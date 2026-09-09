/* All academic content is in index.html. JavaScript only enhances the page. */
(() => {
  'use strict';

  const menu = document.querySelector('#navigation');
  const toggle = document.querySelector('#menu-toggle');
  if (menu && toggle) {
    const closeMenu = () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.documentElement.classList.add('js-enabled');
  }

  const reducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let paused = Boolean(reducedMotion && reducedMotion.matches);
  const motion = document.querySelector('#motion');
  let animateStars = null;
  let starFrame = 0;

  function startStars() {
    if (animateStars && !starFrame && !paused && !document.hidden) {
      starFrame = requestAnimationFrame(animateStars);
    }
  }

  function stopStars() {
    if (starFrame) cancelAnimationFrame(starFrame);
    starFrame = 0;
  }

  function updateMotion() {
    document.body.classList.toggle('paused', paused);
    document.body.classList.toggle('motion-ready', !paused);
    if (motion) {
      motion.hidden = false;
      motion.setAttribute('aria-pressed', String(paused));
      motion.textContent = paused ? '▷ Activar animaciones' : 'Ⅱ Pausar animaciones';
    }
    if (paused) stopStars();
    else startStars();
  }

  if (motion) {
    motion.addEventListener('click', () => {
      paused = !paused;
      updateMotion();
    });
  }
  if (reducedMotion) {
    const onMotionChange = event => {
      paused = event.matches;
      updateMotion();
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
    else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
  }
  updateMotion();

  // Entrance effects never hide the content before it is reached.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, {threshold: 0.06});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }

  const sections = Array.from(document.querySelectorAll('#carrera, .year-block, #admisiones'));
  const progress = document.querySelector('#reading-progress');
  const links = menu ? Array.from(menu.querySelectorAll('a')) : [];
  let scrollPending = false;
  function scrollState() {
    scrollPending = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
    let active = '';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.4) active = section.id;
    });
    links.forEach(link => {
      if (link.hash === '#' + active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleScrollState() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(scrollState);
  }
  window.addEventListener('scroll', scheduleScrollState, {passive: true});
  window.addEventListener('resize', scheduleScrollState, {passive: true});
  window.addEventListener('load', scrollState, {once: true});
  scrollState();

  const art = document.querySelector('.game-scene');
  window.addEventListener('pointermove', event => {
    if (paused || !art || event.pointerType === 'touch') return;
    art.style.setProperty('--mx', ((event.clientX / window.innerWidth - 0.5) * 12) + 'px');
    art.style.setProperty('--my', ((event.clientY / window.innerHeight - 0.5) * 8) + 'px');
  }, {passive: true});

  // Canvas is decorative; unsupported devices keep the full page and gradients.
  const canvas = document.querySelector('#space-dust');
  let context = null;
  try {
    context = canvas && canvas.getContext('2d');
  } catch (_) {
    return;
  }
  if (!context) return;
  let width = 0;
  let height = 0;
  let stars = [];
  let lastFrame = 0;

  function drawStars(time, move) {
    context.clearRect(0, 0, width, height);
    stars.forEach(star => {
      if (move) {
        star.y = (star.y - star.speed + height) % height;
        star.x = (star.x + star.speed * 0.2 + width) % width;
      }
      context.fillStyle = `rgba(151,199,255,${0.18 + (0.5 + 0.5 * Math.sin(time * 0.0005 + star.phase)) * 0.45})`;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });
  }

  function resizeStars() {
    width = Math.max(window.innerWidth, 1);
    height = Math.max(window.innerHeight, 1);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({length: Math.min(95, Math.floor(width * height / 11000))}, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() + 0.25,
      speed: Math.random() * 0.13 + 0.03,
      phase: Math.random() * 6
    }));
    drawStars(0, false);
  }

  animateStars = time => {
    starFrame = 0;
    if (paused || document.hidden) return;
    if (time - lastFrame >= 40) {
      lastFrame = time;
      drawStars(time, true);
    }
    startStars();
  };
  window.addEventListener('resize', resizeStars, {passive: true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopStars();
    else startStars();
  });
  resizeStars();
  startStars();
})();

/* ═══════════════════════════════════════════════════════
   Portfolio — script.js
   Claude-orange palette: rgba(217, 119, 87, opacity)
═══════════════════════════════════════════════════════ */

/* ── 1. TYPEWRITER ──────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const lines = [
    'AI Full-Stack Engineer',
    'Multi-Agent Systems',
    'LLM Pipeline Builder',
    'Production Shipping'
  ];
  let li = 0, ci = 0, deleting = false;

  function tick() {
    const target = lines[li];
    if (!deleting) {
      el.textContent = target.slice(0, ++ci);
      if (ci >= target.length) { deleting = true; setTimeout(tick, 2000); return; }
    } else {
      el.textContent = target.slice(0, --ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
    }
    setTimeout(tick, deleting ? 45 : 90);
  }
  setTimeout(tick, 600);
})();

/* ── 2. MOUSE PARALLAX (CSS vars) ───────────────────── */
document.addEventListener('mousemove', function(e) {
  const main = document.getElementById('main-content');
  if (!main) return;
  const rect = main.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  document.documentElement.style.setProperty('--mouse-x', x + '%');
  document.documentElement.style.setProperty('--mouse-y', y + '%');
}, { passive: true });

/* ── 3. SCROLL PARALLAX ─────────────────────────────── */
let lastScrollY = 0;
let scrollRAF = false;
window.addEventListener('scroll', function() {
  lastScrollY = window.scrollY;
  if (!scrollRAF) {
    scrollRAF = true;
    requestAnimationFrame(function() {
      document.documentElement.style.setProperty('--scroll-y', lastScrollY + 'px');
      scrollRAF = false;
    });
  }
}, { passive: true });

/* ── 4. SCROLL-REVEAL (IntersectionObserver) ─────────── */
(function initReveal() {
  const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.hidden').forEach(function(el) { io.observe(el); });
})();

/* ── 5. NAV SPY (sidebar + mobile nav) ──────────────── */
(function initNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const mobileLinks  = document.querySelectorAll('.mobile-nav-item');

  function setActive(id) {
    sidebarLinks.forEach(function(a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
    mobileLinks.forEach(function(a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) setActive(e.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(function(s) { io.observe(s); });
})();

/* ── 6. PROJECT FILTER ─────────────────────────────── */
(function initFilter() {
  const btns   = document.querySelectorAll('.filter-btn');
  const cards  = document.querySelectorAll('.project-card');
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(function(c) {
        c.classList.toggle('hidden-card', f !== 'all' && c.dataset.category !== f);
      });
    });
  });
})();

/* ── 7. DRAG-SCROLL on project scroller ─────────────── */
(function initDragScroll() {
  const el = document.getElementById('projects-scroller');
  if (!el) return;
  let isDown = false, startX = 0, scrollLeft = 0;
  el.addEventListener('mousedown',  function(e) { isDown = true; el.classList.add('grabbing'); startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; });
  el.addEventListener('mouseleave', function()  { isDown = false; el.classList.remove('grabbing'); });
  el.addEventListener('mouseup',    function()  { isDown = false; el.classList.remove('grabbing'); });
  el.addEventListener('mousemove',  function(e) { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; el.scrollLeft = scrollLeft - (x - startX) * 1.5; });
})();

/* ── 8. MODALS ──────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

function closeModalOverlay(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(function(m) {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

/* ── 9. PARTICLE CANVAS (Claude orange) ─────────────── */
(function initCanvas() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const COUNT = isMobile ? 30 : 70;

  function resize() {
    const main = document.getElementById('main-content') || document.body;
    canvas.width  = main.offsetWidth;
    canvas.height = main.offsetHeight;
  }
  resize();

  const particles = [];
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1
    });
  }

  let lastFrame = 0;
  const FPS_LIMIT = isMobile ? 20 : 30;
  const INTERVAL  = 1000 / FPS_LIMIT;

  function draw(ts) {
    requestAnimationFrame(draw);
    if (ts - lastFrame < INTERVAL) return;
    lastFrame = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 119, 87, ' + p.opacity + ')';
      ctx.fill();
    });

    // Draw connecting lines (orange)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(217, 119, 87, ' + (0.08 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  requestAnimationFrame(draw);
  window.addEventListener('resize', resize, { passive: true });
})();

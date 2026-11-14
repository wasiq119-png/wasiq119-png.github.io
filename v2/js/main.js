// Interface layer: scroll → camera position, reveals, status, stack connections, magnetic buttons.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mobile = () => innerWidth < 900;
const rand = (a, b) => a + Math.random() * (b - a);

/* paper grain */
(() => {
  const c = document.createElement('canvas'); c.width = c.height = 140;
  const x = c.getContext('2d'), d = x.createImageData(140, 140);
  for (let i = 0; i < d.data.length; i += 4) { const v = 70 + Math.random() * 110; d.data[i] = v; d.data[i + 1] = v * 0.96; d.data[i + 2] = v * 0.88; d.data[i + 3] = Math.random() * 20; }
  x.putImageData(d, 0, 0);
  $('.grain').style.backgroundImage = `url(${c.toDataURL()})`;
})();

/* hero: split into characters so the type can come apart on scroll */
if (!reduced) $$('#hero-title .line-in').forEach((l) => {
  const text = l.textContent; l.textContent = '';
  for (const ch of text) {
    if (ch === ' ') { l.append(' '); continue; }
    const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch;
    s.style.setProperty('--dx', rand(-150, 150).toFixed(0)); s.style.setProperty('--dy', rand(-300, -40).toFixed(0));
    s.style.setProperty('--dr', rand(-32, 32).toFixed(0)); s.style.setProperty('--df', rand(1.1, 2.4).toFixed(2));
    l.append(s);
  }
});

/* anchors: every [data-cam] element is a camera keyframe at the scroll position where it is centred */
let anchors = [], maxScroll = 1;
const camEls = $$('[data-cam]');
const idx = Object.fromEntries(camEls.map((el, i) => [el.dataset.cam, i]));
function measure() {
  const sy = scrollY, vh = innerHeight;
  maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
  anchors = camEls.map((el) => { const r = el.getBoundingClientRect(); return clamp(r.top + sy + r.height / 2 - vh / 2, 0, maxScroll); });
  anchors[0] = 0; anchors[anchors.length - 1] = maxScroll;
  for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
}
function fAt(y) {
  for (let i = 0; i < anchors.length - 1; i++) if (y <= anchors[i + 1]) return i + clamp((y - anchors[i]) / (anchors[i + 1] - anchors[i]));
  return anchors.length - 1;
}

/* reveals */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
$$('[data-reveal]').forEach((el) => io.observe(el));

/* status readout */
const stateEl = $('#status-state'); let stateNow = 'Idle', stateTimer = 0;
function setState(s) {
  if (s === stateNow) return; stateNow = s;
  if (reduced) { stateEl.textContent = s; return; }
  stateEl.classList.add('out'); clearTimeout(stateTimer);
  stateTimer = setTimeout(() => { stateEl.textContent = s; stateEl.classList.remove('out'); stateEl.classList.add('pre'); void stateEl.offsetWidth; stateEl.classList.remove('pre'); }, 260);
}

/* per-frame DOM sync (only when scroll changes) */
const nav = $('#nav'), hero = $('#top'), rail = $('#rail-dot'), principles = $$('.principle');
const timeline = $('#timeline'), portrait = $('.portrait'), sections = $$('[data-state]'), veil = $('.veil');
let lastY = -1, lastK = -2;
function sync(y, f) {
  const vh = innerHeight;
  hero.style.setProperty('--p', clamp(y / (vh * 0.85)).toFixed(3));
  rail.style.setProperty('--rail', (y / maxScroll).toFixed(4));
  nav.classList.toggle('small', y > 40);
  nav.classList.toggle('dim', f > idx.p1 - 0.45 && f < idx.p4 + 0.5);
  // principles, one at a time
  const k = f < idx.p1 - 0.55 ? -1 : f > idx.p4 + 0.6 ? 4 : clamp(Math.round(f - idx.p1), 0, 3);
  if (k !== lastK) { lastK = k; principles.forEach((p, i) => { p.classList.toggle('on', i === k); p.classList.toggle('was', i < k); }); }
  // section state
  const mid = vh * 0.5; let st = stateNow;
  for (const s of sections) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) { st = s.dataset.state; break; } }
  setState(st);
  // timeline grows, portrait opens from a slice
  if (!reduced) {
    let r = timeline.getBoundingClientRect(); timeline.style.setProperty('--grow', clamp((vh * 0.8 - r.top) / r.height).toFixed(3));
    r = portrait.getBoundingClientRect(); const s = clamp((vh * 0.95 - r.top) / (vh * 0.5));
    portrait.style.setProperty('--slice', (0.04 + 0.96 * s * s * (3 - 2 * s)).toFixed(3));
  }
}

/* magnetic buttons: a small spring towards the pointer */
const magnets = fine && !reduced ? $$('[data-magnetic]').map((el) => ({ el, inner: el.firstElementChild, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, live: false })) : [];
if (magnets.length) addEventListener('pointermove', (e) => {
  for (const m of magnets) {
    const r = m.el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const near = Math.abs(e.clientX - cx) < r.width / 2 + 46 && Math.abs(e.clientY - cy) < r.height / 2 + 46;
    m.tx = near ? (e.clientX - cx) * 0.3 : 0; m.ty = near ? (e.clientY - cy) * 0.36 : 0; m.live = true;
  }
}, { passive: true });
function springs(dt) {
  for (const m of magnets) {
    if (!m.live) continue;
    m.vx += ((m.tx - m.x) * 170 - m.vx * 17) * dt; m.vy += ((m.ty - m.y) * 170 - m.vy * 17) * dt;
    m.x += m.vx * dt; m.y += m.vy * dt;
    if (Math.abs(m.x) + Math.abs(m.y) + Math.abs(m.vx) + Math.abs(m.vy) < 0.02 && !m.tx && !m.ty) { m.x = m.y = 0; m.live = false; }
    m.el.style.transform = `translate(${m.x.toFixed(2)}px,${m.y.toFixed(2)}px)`;
    m.inner.style.transform = `translate(${(m.x * 0.35).toFixed(2)}px,${(m.y * 0.35).toFixed(2)}px)`;
  }
}

/* mobile menu */
const menuBtn = $('#menu-btn');
const setMenu = (open) => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.firstElementChild.textContent = open ? 'Close' : 'Menu'; document.body.style.overflow = open ? 'hidden' : ''; };
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('#nav-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* the stack: a technology lights up everything it is built together with */
const USED = {
  'AI Software House': ['Next.js', 'TypeScript', 'Tailwind CSS', 'Multi-agent systems', 'Groq LLMs', 'PostgreSQL', 'Prisma'],
  'StellenPortal Deutschland': ['React', 'Next.js', 'TypeScript', 'Three.js', 'Tailwind CSS'],
  'AI Job Assistant': ['React', 'Three.js', 'Groq LLMs', 'Spring AI', 'Java', 'Spring Boot', 'REST APIs', 'PostgreSQL', 'Docker'],
  'DataOps Framework': ['TypeScript', 'Node.js', 'Docker', 'Kubernetes'],
  'Neuro Tracker': ['Java', 'SQLite'],
  'Inseyab Consulting': ['TypeScript', 'Angular', 'Java', 'Spring Boot', 'REST APIs'],
};
const layers = $('#layers'), note = $('#system-note'), techBtns = $$('[data-tech]');
let scene = null;
function showTech(btn) {
  const name = btn.dataset.tech, where = Object.keys(USED).filter((p) => USED[p].includes(name));
  const rel = new Set(where.flatMap((p) => USED[p])), tiers = new Set();
  layers.classList.add('active');
  techBtns.forEach((b) => {
    const cur = b === btn, on = rel.has(b.dataset.tech);
    b.classList.toggle('cur', cur); b.classList.toggle('rel', on && !cur);
    if (cur || on) tiers.add(+b.closest('.layer').dataset.tier);
  });
  note.innerHTML = `<b>${name}</b> is used in ${where.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`;
  scene?.setTiers(tiers);
}
function clearTech() { layers.classList.remove('active'); techBtns.forEach((b) => b.classList.remove('cur', 'rel')); note.innerHTML = '&nbsp;'; scene?.setTiers(null); }
techBtns.forEach((b) => { b.addEventListener('pointerenter', () => showTech(b)); b.addEventListener('focus', () => showTech(b)); b.addEventListener('click', () => showTech(b)); b.addEventListener('blur', clearTech); });
layers.addEventListener('pointerleave', clearTech);

/* hovering a project lights its room */
$$('.project-body').forEach((el) => {
  const i = +el.closest('.project').dataset.project;
  el.addEventListener('pointerenter', () => scene?.setHot(i));
  el.addEventListener('pointerleave', () => scene?.setHot(-1));
});

/* pointer = light (desktop only) */
if (fine && !reduced) {
  addEventListener('pointermove', (e) => scene?.pointer((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1, true), { passive: true });
  document.addEventListener('pointerleave', () => scene?.pointer(0, 0, false));
}

/* loop */
let prevT = 0;
function frame(t) {
  const dt = Math.min(0.05, (t - prevT) / 1000); prevT = t;
  const y = scrollY, f = fAt(y);
  if (y !== lastY) { lastY = y; sync(y, f); }
  springs(dt);
  if (scene) { scene.update(f, t); veil.style.setProperty('--veil', (scene.state.white * 0.55).toFixed(3)); }
  requestAnimationFrame(frame);
}
measure();
requestAnimationFrame(frame);
let rt = 0;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); scene?.resize(); lastY = -1; }, 120); });
addEventListener('load', () => { measure(); lastY = -1; });
document.fonts?.ready.then(() => { measure(); lastY = -1; });

/* scene: loaded after first paint; the loader only appears if that takes a moment */
const loader = $('#loader'), canvas = $('#gl');
const showLoader = setTimeout(() => loader.classList.add('show'), 400);
import('./scene.js').then((m) => {
  scene = m.createScene(canvas, { mobile: mobile(), reduced, idx });
  clearTimeout(showLoader);
  const reveal = () => { loader.classList.remove('show'); canvas.classList.add('on'); };
  if (loader.classList.contains('show')) { $('#loader-state').textContent = 'System ready'; setTimeout(reveal, 420); } else reveal();
}).catch((err) => { clearTimeout(showLoader); loader.classList.remove('show'); console.warn('3D scene unavailable, continuing without it.', err); });

// Typing Animation
const words = ["Angular & React Apps", "Java & Python Backend", "Modern Node.js APIs", "Interactive Full-Stack Solutions"];
let i = 0;
let j = 0;
let isDeleting = false;
let currentWord = "";
const el = document.querySelector(".type-wrap");

function type() {
    if (!el) return;

    currentWord = words[i];

    if (isDeleting) {
        el.textContent = currentWord.substring(0, j - 1);
        j--;
    } else {
        el.textContent = currentWord.substring(0, j + 1);
        j++;
    }

    let typeSpeed = 100;

    if (isDeleting) {
        typeSpeed /= 2;
    }

    if (!isDeleting && j === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && j === 0) {
        isDeleting = false;
        i = (i + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(type, 1000);
});

// Scroll Reveal
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('skill-item')) {
                // Staggered reveal for skills
                const skills = Array.from(document.querySelectorAll('.skill-item'));
                const skillIndex = skills.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('show');
                }, skillIndex * 100);
            } else {
                entry.target.classList.add('show');
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.hidden').forEach((el) => {
    observer.observe(el);
});

// Copy to Clipboard Feature
function copyText(text, el) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = el.querySelector('i');
        const originalClass = icon.className;
        
        icon.className = 'fa-solid fa-check';
        el.style.color = 'var(--accent-2)';
        el.style.opacity = '1';

        setTimeout(() => {
            icon.className = originalClass;
            el.style.color = '';
            el.style.opacity = '0.5';
        }, 1500);
    });
}

// Navigation Highlight
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-item");

// 3D Cyber Background Particle System
const canvas = document.getElementById('cyber-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', e => {
    mouse.x = e.x;
    mouse.y = e.y;
});

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse repulsion
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                this.x -= dx / 20;
                this.y -= dy / 20;
            }
        }

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    draw() {
        ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Track whether the tab is hidden. Robust across Chrome/Edge (works
// whether the engine exposes `document.hidden` or `document.visibilityState`).
let tabVisible = true;
if (typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
        tabVisible = !(document.hidden === true
            || (typeof document.visibilityState !== 'undefined' && document.visibilityState === 'hidden'));
    });
}
function tabHides() { return !tabVisible; }

function isPhoneViewport() {
    const w = window.innerWidth || document.documentElement.clientWidth;
    return w <= 768;
}

function initParticles() {
    resizeCanvas();
    const count = isPhoneViewport() ? 40 : 80;
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

let lastFrameTime = 0;
// 60fps on desktop, ~30fps on phones. A slower canvas means the blurred
// nav doesn't have to re-blur the entire scene at max frequency.
let FRAME_INTERVAL_MS = isPhoneViewport() ? 1000 / 30 : 1000 / 60;

function animate() {
    // Freeze heavy rendering entirely while the tab is hidden (battery/GPU).
    if (tabHides()) {
        lastFrameTime = performance.now();
        requestAnimationFrame(animate);
        return;
    }

    const now = performance.now();
    const elapsed = now - lastFrameTime;
    if (elapsed < FRAME_INTERVAL_MS) {
        requestAnimationFrame(animate);
        return;
    }
    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

// Initializing Cyber Background
initParticles();
animate();

// Active-section nav highlight via IntersectionObserver: no layout reads
// inside a scroll listener, so the dock and page don't re-layout while you
// scroll (this killed the mobile jitter/flicker).
const navSpy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (!entry.isIntersecting) {
            // When a section leaves the center band entirely, drop its pill.
            document.querySelectorAll('.nav-item').forEach((link) => {
                if (link.getAttribute('href').includes(id)) link.classList.remove('active');
            });
            return;
        }
        document.querySelectorAll('.nav-item').forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href').includes(id));
        });
    });
}, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
document.querySelectorAll('section').forEach((s) => navSpy.observe(s));

// 3D grid parallax — rAF-throttled + pass-throttled, never on the raw
// scroll event (that was sync and per sub-pixel on touch → stutter).
let parallaxDirty = false;
let lastY = window.scrollY;
window.addEventListener('scroll', () => { parallaxDirty = true; }, { passive: true });

function parallaxLoop() {
    if (!tabHides() && parallaxDirty) {
        parallaxDirty = false;
        const y = window.scrollY;
        if (y !== lastY) {
            lastY = y;
            document.documentElement.style.setProperty('--scroll-y', `${Math.round(y * 0.15)}px`);
        }
    }
    requestAnimationFrame(parallaxLoop);
}
requestAnimationFrame(parallaxLoop);

// Spotlight Hover Effect
document.querySelectorAll('.spotlight-wrapper, .glass-card:not(.project-card), .project-card').forEach(wrapper => {
    wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        wrapper.style.setProperty('--mouse-x', `${x}px`);
        wrapper.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Project Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden-project');
            } else {
                card.classList.add('hidden-project');
            }
        });
    });
});

// Modal Functions
function openModal(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close on outside click for all modals
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

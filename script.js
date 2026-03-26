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
        ctx.fillStyle = `rgba(168, 85, 247, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    resizeCanvas();
    particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }
}

function animate() {
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

// Modern Scroll Interaction
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    
    // Update active section in nav
    let currentSection = '';
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollPos >= sectionTop - 150) {
            currentSection = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(currentSection)) {
            link.classList.add('active');
        }
    });

    // 3D Grid Parallax
    document.documentElement.style.setProperty('--scroll-y', `${scrollPos * 0.15}px`);
});

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

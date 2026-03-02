import { showToast } from './nav.js';

// Three.js particle field background
async function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function makeParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
        };
    }

    for (let i = 0; i < 120; i++) particles.push(makeParticle());

    let mouse = { x: W / 2, y: H / 2 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    function draw() {
        ctx.clearRect(0, 0, W, H);
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(72,199,142,${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
            // Move
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            if (particles[i].x < 0 || particles[i].x > W) particles[i].vx *= -1;
            if (particles[i].y < 0 || particles[i].y > H) particles[i].vy *= -1;
            // Mouse repel
            const mx = particles[i].x - mouse.x;
            const my = particles[i].y - mouse.y;
            const md = Math.sqrt(mx * mx + my * my);
            if (md < 100) {
                particles[i].x += mx / md * 0.5;
                particles[i].y += my / md * 0.5;
            }
            // Draw dot
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(72,199,142,${particles[i].alpha})`;
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// GSAP-style entrance animations using CSS transitions + timing
function runEntranceAnimations() {
    const items = document.querySelectorAll('.fade-up');
    items.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.08}s`;
        el.classList.add('visible');
    });
}

// Animate stat counter
function animateHeroStat() {
    const el = document.getElementById('statUsers');
    if (!el) return;
    let count = 2500;
    const target = 2841;
    const step = () => {
        count = Math.min(count + 17, target);
        el.textContent = count.toLocaleString();
        if (count < target) requestAnimationFrame(step);
    };
    setTimeout(step, 800);
}

// Spline viewer fallback
function handleSplineFallback() {
    const viewer = document.querySelector('spline-viewer');
    if (!viewer) return;
    const fallback = document.getElementById('earthFallback');
    // Show fallback after short delay if spline hasn't loaded
    setTimeout(() => {
        try {
            if (viewer && !viewer.shadowRoot?.querySelector('canvas')) {
                if (fallback) fallback.style.display = 'flex';
            }
        } catch { if (fallback) fallback.style.display = 'flex'; }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    setTimeout(runEntranceAnimations, 100);
    animateHeroStat();
    handleSplineFallback();
});

// effects.js — Cursor trail + click burst for Lumen
(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'trailCanvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W, H;
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#f59e0b', '#fb7185', '#6366f1', '#ea580c'];
    const particles = [];

    document.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 2; i++) {
            particles.push({
                x: e.clientX + (Math.random() - 0.5) * 8,
                y: e.clientY + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                life: 1,
                size: Math.random() * 5 + 3,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                isBurst: false
            });
        }
        if (particles.length > 300) particles.splice(0, particles.length - 300);
    });

    document.addEventListener('mousedown', (e) => {
        const count = 22;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = Math.random() * 6 + 4;
            particles.push({
                x: e.clientX, y: e.clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: Math.random() * 6 + 4,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                isBurst: true
            });
        }
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });

    function animate() {
        ctx.clearRect(0, 0, W, H);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.isBurst) {
                p.vx *= 0.94;
                p.vy *= 0.94;
                p.life -= 0.025;
            } else {
                p.vx *= 0.97;
                p.vy *= 0.97;
                p.vy += 0.08;
                p.life -= 0.028;
            }
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = p.life * 0.9;
            ctx.shadowBlur = 14;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        requestAnimationFrame(animate);
    }
    animate();

    console.log('✨ Effects loaded');
})();
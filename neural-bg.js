// neural-bg.js — Amber-tinted neural network background
(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'neuralBg';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');

    let W, H, nodes = [];
    let mouseX = -9999, mouseY = -9999;
    let running = true;

    const COUNT_DESKTOP = 60;
    const COUNT_MOBILE = 25;
    const MAX_LINK = 150;
    const MOUSE_RADIUS = 180;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        const count = window.innerWidth < 640 ? COUNT_MOBILE : COUNT_DESKTOP;
        nodes = [];
        for (let i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.6 + 0.7,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_LINK) {
                    const a = (1 - dist / MAX_LINK) * 0.3;
                    ctx.strokeStyle = `rgba(245, 158, 11, ${a})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        for (const n of nodes) {
            const dx = n.x - mouseX;
            const dy = n.y - mouseY;
            const md = Math.sqrt(dx * dx + dy * dy);
            if (md < MOUSE_RADIUS) {
                const force = (1 - md / MOUSE_RADIUS) * 0.6;
                n.vx += (dx / md) * force * 0.15;
                n.vy += (dy / md) * force * 0.15;
            }
            n.x += n.vx;
            n.y += n.vy;
            n.vx *= 0.985;
            n.vy *= 0.985;
            if (n.x < 0) n.x = W;
            if (n.x > W) n.x = 0;
            if (n.y < 0) n.y = H;
            if (n.y > H) n.y = 0;

            ctx.fillStyle = '#f59e0b';
            ctx.globalAlpha = 0.65;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
            if (n.r > 1.4) {
                ctx.globalAlpha = 0.15;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        if (running) requestAnimationFrame(draw);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) running = false;
        else { running = true; draw(); }
    });

    window.addEventListener('resize', resize);
    resize();
    draw();
    console.log('🌐 Neural background ready');
})();
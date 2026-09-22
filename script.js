// Lumen — interactions

// ===== Theme toggle (default: dark) =====
const savedTheme = localStorage.getItem('lumen-theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);

// ===== Waitlist form =====
const form = document.getElementById('waitlistForm');
const note = document.getElementById('waitlistNote');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.waitlist-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Joining...';
        btn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                note.textContent = "🎉 You're on the list! We'll email you at launch.";
                note.style.color = 'var(--accent)';
                form.reset();
            } else {
                note.textContent = 'Something went wrong. Please try again.';
                note.style.color = '#f43f5e';
            }
        } catch (err) {
            note.textContent = 'Network error. Please try again.';
            note.style.color = '#f43f5e';
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// ===== Smooth scroll for nav links =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Fade in sections on scroll =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.section, .template-card, .feature').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
});

console.log('✨ Lumen loaded');
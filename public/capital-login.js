document.addEventListener('DOMContentLoaded', () => {
    // Parallax Setup (reusing from script.js, simplified)
    const parallaxContainer = document.getElementById('parallax-container');
    if (parallaxContainer) {
        for (let i = 0; i < 30; i++) {
            const node = document.createElement('div');
            node.classList.add('node');
            const size = Math.random() * 4 + 2;
            const x = Math.random() * 100;
            const y = Math.random() * 150;
            node.style.width = `${size}px`;
            node.style.height = `${size}px`;
            node.style.left = `${x}vw`;
            node.style.top = `${y}vh`;
            const speed = Math.random() * 0.5 + 0.1;
            parallaxContainer.appendChild(node);
            window.addEventListener('scroll', () => {
                const yOffset = window.scrollY * speed;
                node.style.transform = `translateY(-${yOffset}px)`;
            });
        }
    }

    const lenderForm = document.getElementById('lender-form');
    lenderForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('lender-email').value;
        const password = document.getElementById('lender-password').value;
        const btn = document.getElementById('btn-lender-login');
        btn.textContent = 'Authenticating...';
        btn.disabled = true;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, roleType: 'LENDER' })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                let pId = 'bank';
                if (email.includes('stride')) pId = 'nbfc';
                if (email.includes('harbor')) pId = 'fund';

                db.login(pId);
                localStorage.setItem('FINOVA_AUTH_TOKEN', data.token);
                localStorage.setItem('FINOVA_USER_DATA', JSON.stringify(data.user));
                window.location.href = 'capital-dashboard.html';
            } else {
                btn.disabled = false;
                btn.textContent = 'Login as Lender';
                alert(data.message || 'Authentication failed. Check credentials.');
            }
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Login as Lender';
            alert('Authentication failed: Could not connect to Fastify server.');
        }
    });
});

async function quickLogin(providerId) {
    const emailMap = {
        'bank': 'apex@lender.com',
        'nbfc': 'stride@lender.com',
        'fund': 'harbor@lender.com'
    };
    const email = emailMap[providerId] || 'apex@lender.com';
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'demo123', roleType: 'LENDER' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            db.login(providerId);
            localStorage.setItem('FINOVA_AUTH_TOKEN', data.token);
            localStorage.setItem('FINOVA_USER_DATA', JSON.stringify(data.user));
            window.location.href = 'capital-dashboard.html';
        } else {
            alert('Authentication failed: ' + (data.message || 'Invalid credentials'));
        }
    } catch (e) {
        db.login(providerId);
        window.location.href = 'capital-dashboard.html';
    }
}

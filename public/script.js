document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Parallax Background ---
    const parallaxContainer = document.getElementById('parallax-container');
    const numNodes = 40;
    const nodes = [];

    // Generate random nodes
    for (let i = 0; i < numNodes; i++) {
        const node = document.createElement('div');
        node.classList.add('node');
        
        // Random properties
        const size = Math.random() * 4 + 2; // 2px to 6px
        const x = Math.random() * 100; // vw
        const y = Math.random() * 200; // vh (to cover scroll area)
        const speed = Math.random() * 0.5 + 0.1; // Parallax speed multiplier
        
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.left = `${x}vw`;
        node.style.top = `${y}vh`;
        
        parallaxContainer.appendChild(node);
        nodes.push({ element: node, speed: speed, initialY: y });
    }

    // Scroll event for parallax
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        nodes.forEach(nodeObj => {
            const yOffset = scrollY * nodeObj.speed;
            nodeObj.element.style.transform = `translateY(-${yOffset}px)`;
        });
    });


    // --- 2. Card Interaction Logic ---
    const card3d = document.getElementById('login-card');
    const btnSupplier = document.getElementById('btn-supplier');
    const btnCapital = document.getElementById('btn-capital');
    const btnBack = document.getElementById('btn-back');

    // Supplier Click -> Flip Card
    btnSupplier.addEventListener('click', () => {
        card3d.classList.add('is-flipped');
    });

    // Back Click -> Unflip Card
    btnBack.addEventListener('click', () => {
        card3d.classList.remove('is-flipped');
    });

    btnCapital.addEventListener('click', () => {
        window.location.href = 'capital-login.html';
    });


    // --- 3. Form Submission Logic ---
    const supplierForm = document.getElementById('supplier-form');
    const authBtn = document.getElementById('auth-btn');

    function showToast(msg, isError = false) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (isError) {
            toast.style.borderColor = '#ff5f56';
            toast.style.color = '#ff5f56';
        }
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    supplierForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        authBtn.classList.add('loading');
        authBtn.disabled = true;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, roleType: 'SUPPLIER' })
            });

            const data = await res.json();
            authBtn.classList.remove('loading');

            if (res.ok && data.success) {
                db.login('supplier');
                localStorage.setItem('FINOVA_AUTH_TOKEN', data.token);
                localStorage.setItem('FINOVA_USER_DATA', JSON.stringify(data.user));

                authBtn.innerHTML = '<span class="btn-text" style="color: #000;">Authentication Successful</span>';
                authBtn.style.background = '#10b981';
                authBtn.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';

                setTimeout(() => {
                    window.location.href = data.user.role === 'SUPPLIER' ? 'dashboard.html' : 'capital-dashboard.html';
                }, 800);
            } else {
                authBtn.disabled = false;
                showToast(data.message || 'Authentication failed. Check credentials.', true);
            }
        } catch (err) {
            authBtn.classList.remove('loading');
            authBtn.disabled = false;
            showToast('Authentication failed. Connection error to server.', true);
        }
    });
});

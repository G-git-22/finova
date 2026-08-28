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

    supplierForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add loading state
        authBtn.classList.add('loading');
        authBtn.disabled = true;
        
        // Simulate network request and hashing
        setTimeout(() => {
            authBtn.classList.remove('loading');
            
            // Show success state briefly before redirect
            const originalText = authBtn.innerHTML;
            authBtn.innerHTML = '<span class="btn-text" style="color: #000;">Authentication Successful</span>';
            authBtn.style.background = '#10b981'; // Success green
            authBtn.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
            
            setTimeout(() => {
                db.login('supplier');
                window.location.href = 'dashboard.html';
            }, 1000);
            
        }, 1500);
    });
});

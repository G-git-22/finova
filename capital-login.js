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
});

function quickLogin(providerId) {
    db.login(providerId);
    window.location.href = 'capital-dashboard.html';
}

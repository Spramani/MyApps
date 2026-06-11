document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe app cards
    const appCards = document.querySelectorAll('.app-card');
    appCards.forEach(card => {
        observer.observe(card);
    });

    // Add a slight parallax effect to the glow orbs on mousemove
    const orbs = document.querySelectorAll('.glow-orb');
    
    // Throttling the mousemove event for performance
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;

                orbs.forEach((orb, index) => {
                    const speed = (index + 1) * 20;
                    const xOffset = (x - 0.5) * speed;
                    const yOffset = (y - 0.5) * speed;
                    orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });
});

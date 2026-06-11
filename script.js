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

    // Custom Cursor
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    const cursorFollower = document.createElement('div');
    cursorFollower.classList.add('custom-cursor-follower');
    
    // Only append custom cursor if not on mobile (touch device)
    if (window.matchMedia("(pointer: fine)").matches) {
        document.body.appendChild(cursor);
        document.body.appendChild(cursorFollower);
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let ticking = false;

    const orbs = document.querySelectorAll('.glow-orb');

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update primary cursor immediately
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
        
        // Parallax effect on background orbs
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const x = mouseX / window.innerWidth;
                const y = mouseY / window.innerHeight;

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

    // Smooth animation for cursor follower
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        cursorFollower.style.left = `${followerX}px`;
        cursorFollower.style.top = `${followerY}px`;
        
        requestAnimationFrame(animateFollower);
    }
    
    if (window.matchMedia("(pointer: fine)").matches) {
        animateFollower();
    }

    // Cursor hover effects on interactable elements
    const interactables = document.querySelectorAll('a, input, button, .btn-play');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursorFollower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorFollower.classList.remove('active');
        });
    });

    // Search / Filter Functionality
    const searchInput = document.getElementById('app-search');
    const appCardsArray = Array.from(document.querySelectorAll('.app-card'));

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            appCardsArray.forEach(card => {
                const appName = card.querySelector('.app-name').innerText.toLowerCase();
                const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.innerText.toLowerCase());
                
                const matches = appName.includes(searchTerm) || tags.some(tag => tag.includes(searchTerm));
                
                if (matches) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10); // slight delay to allow display block to apply before transition
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300); // Wait for fade out to complete
                }
            });
        });
    }

    // 3D Tilt Effect for App Cards
    appCardsArray.forEach(card => {
        const inner = card.querySelector('.card-inner');
        
        card.addEventListener('mousemove', (e) => {
            // Disable on touch devices
            if (!window.matchMedia("(pointer: fine)").matches) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top; // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation. Inverse for y to tilt in the direction of the mouse
            const rotateX = ((y - centerY) / centerY) * -12; // max rotation degrees
            const rotateY = ((x - centerX) / centerX) * 12;
            
            inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            if (!window.matchMedia("(pointer: fine)").matches) return;
            
            // Reset transition
            inner.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            inner.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            
            // Restore regular transition after reset
            setTimeout(() => {
                inner.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }, 500);
        });
    });
});

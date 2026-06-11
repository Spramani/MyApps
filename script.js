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

    // Observe reveal elements
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        observer.observe(el);
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
    const interactables = document.querySelectorAll('a, input, button, .btn-play, .filter-btn, .theme-toggle, .close-modal');
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

    // Theme Toggle Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Check local storage
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        
        if (isLight) {
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    });

    // Category Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const appCardsArray = Array.from(document.querySelectorAll('.app-card'));

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            appCardsArray.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

    // Particle Canvas Background
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
                this.size = Math.random() * 2 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    this.x -= dx * 0.02;
                    this.y -= dy * 0.02;
                }
            }
            draw() {
                ctx.fillStyle = document.body.classList.contains('light-mode') ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const numParticles = Math.floor((width * height) / 15000);
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = dx * dx + dy * dy;
                    if (dist < 10000) {
                        ctx.strokeStyle = document.body.classList.contains('light-mode') ? `rgba(0, 0, 0, ${0.1 - dist/100000})` : `rgba(255, 255, 255, ${0.1 - dist/100000})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
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

    // App Data for Modals
    const appData = {
        'drifty': {
            title: 'Drifty',
            icon: './assets/drifty_app_icon.png',
            desc: 'Get ready for the ultimate high-octane racing experience. Drifty puts you in the driver seat of customized supercars as you master the art of drifting around tight corners and competing against the best in the world. Experience next-gen 3D graphics and realistic physics.',
            stats: 'Downloads: 50k+ | Rating: 4.8 ★',
            url: 'https://spramani.github.io/Drifty_url/',
            images: ['./assets/drifty_app_icon.png'] // Using icon as placeholder for screenshots
        },
        'aquasort': {
            title: 'AquaSort',
            icon: './assets/aquasort_app_icon.png',
            desc: 'A relaxing, brain-teasing puzzle game where you sort colored water into matching tubes. Sounds simple? As you progress, the puzzles get increasingly challenging, requiring strategic thinking and planning. Relax your mind with satisfying ASMR sound effects and beautiful fluid animations.',
            stats: 'Downloads: 100k+ | Rating: 4.9 ★',
            url: 'https://spramani.github.io/AquaSort_Urls/',
            images: ['./assets/aquasort_app_icon.png']
        }
    };

    const modal = document.getElementById('app-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    // Expose openModal to global scope
    window.openModal = function(appId) {
        const data = appData[appId];
        if (!data) return;

        modalBody.innerHTML = `
            <div class="modal-header">
                <img src="${data.icon}" alt="${data.title}" class="modal-icon">
                <div>
                    <h2 class="modal-title">${data.title}</h2>
                    <div class="modal-stats">${data.stats}</div>
                </div>
            </div>
            <div class="modal-gallery">
                ${data.images.map(img => `<img src="${img}" alt="Screenshot">`).join('')}
            </div>
            <p class="modal-desc">${data.desc}</p>
            <div style="text-align: center;">
                <a href="${data.url}" target="_blank" class="modal-action">Launch App</a>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

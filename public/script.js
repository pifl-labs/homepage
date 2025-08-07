// PiFl Labs Interactive Script

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            console.log('Menu toggled'); // Debug log
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Logo click - return to home and clear hash
    const logo = document.getElementById('logoHome');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear URL hash and go to top
            history.pushState(null, null, window.location.pathname);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Close mobile menu if open
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetHash = this.getAttribute('href');
        const target = document.querySelector(targetHash);
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            // Update URL hash
            history.pushState(null, null, targetHash);
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Optimized Scroll Handler (Combined Navigation + Parallax)
let scrollTimeout;
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const parallaxElements = document.querySelectorAll('.wave');

function handleScroll() {
    const scrolled = window.scrollY;
    
    // Navigation highlighting
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrolled >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
    
    // Parallax effect (simplified)
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// Throttled scroll event
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = requestAnimationFrame(() => {
            handleScroll();
            scrollTimeout = null;
        });
    }
}, { passive: true });

// Optimized Intersection Observer (simplified)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe cards only (removed parallax elements for performance)
document.querySelectorAll('.about-card, .feature-card, .crew-card, .app-card').forEach(card => {
    observer.observe(card);
});

// Typed Effect for Hero Title
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const originalText = heroTitle.innerHTML;
    heroTitle.innerHTML = '';
    heroTitle.style.visibility = 'visible';
    
    setTimeout(() => {
        heroTitle.innerHTML = originalText;
    }, 500);
}

// Random PiPi Tips
const tips = [
    "console.log('Ahoy, matey!');",
    "// Bugs are just undocumented features",
    "npm run away-from-bugs",
    "git commit -m 'Fixed the kraken'",
    "flutter pub get treasure",
    "// TODO: Find the One Piece"
];

const speechBubble = document.querySelector('.speech-bubble');
if (speechBubble) {
    let tipIndex = 0;
    setInterval(() => {
        tipIndex = (tipIndex + 1) % tips.length;
        speechBubble.textContent = tips[tipIndex];
    }, 4000);
}

// Dynamic CSS for navigation and animations (simplified)
const style = document.createElement('style');
style.textContent = `
    .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        flex-direction: column;
        background: rgba(15, 23, 42, 0.98);
        padding: var(--spacing-md);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .nav-link.active {
        color: var(--accent-yellow);
    }
`;
document.head.appendChild(style);

// Console Easter Egg
console.log('%c⚓ Welcome aboard, matey! ⚓', 'color: #fbbf24; font-size: 24px; font-weight: bold;');
console.log('%cPiFl Labs - Code like a pirate. Fly like Flutter.', 'color: #6366f1; font-size: 16px;');
console.log('%cJoin the crew at pifl-labs.web.app', 'color: #06b6d4; font-size: 14px;');

// Floating ship animation (removed mousemove for performance)

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Progressive Enhancement Check
if ('serviceWorker' in navigator) {
    // Register service worker for offline capability (optional)
    console.log('Service Worker support detected');
}

// Performance monitoring
const perfData = window.performance.timing;
const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
console.log(`Page loaded in ${pageLoadTime}ms ⚡`);

// Hero button scroll function
function scrollToSection(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.offsetTop - navHeight;
        
        // Update URL hash
        history.pushState(null, null, targetId);
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Screenshot Gallery Control (Simplified)
function initScreenshotGallery() {
    const screenshotsContainer = document.querySelector('.app-screenshots');
    
    if (!screenshotsContainer) return;
    
    const screenshots = screenshotsContainer.querySelectorAll('img');
    
    // Screenshot click to view larger (optional enhancement)
    screenshots.forEach((img, index) => {
        img.addEventListener('click', () => {
            console.log(`Screenshot ${index + 1} clicked: ${img.alt}`);
        });
    });
}

    // Initialize screenshot gallery
    setTimeout(initScreenshotGallery, 100);
    
    console.log('PiFl Labs ready to sail! ⚓');
});
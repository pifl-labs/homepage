// PiFl Labs Interactive Script

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
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
            history.pushState(null, null, window.location.pathname);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Scroll-to buttons (replaces inline onclick handlers)
    document.querySelectorAll('[data-scroll-to]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.scrollTo;
            const target = document.querySelector(targetId);
            if (target) {
                const navEl = document.querySelector('.navbar, .nav');
                const navHeight = navEl ? navEl.offsetHeight : 0;
                const targetPosition = target.offsetTop - navHeight;
                history.pushState(null, null, targetId);
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Email obfuscation - construct mailto links from data attributes
    document.querySelectorAll('[data-email-user]').forEach(el => {
        const user = el.dataset.emailUser;
        const domain = el.dataset.emailDomain;
        const email = user + '@' + domain;
        if (el.tagName === 'A') {
            el.href = 'mailto:' + email;
        }
        const textEl = el.querySelector('.email-text');
        if (textEl) textEl.textContent = email;
    });
});

// Smooth Scroll for Navigation Links — skip elements with data-email-user
// (runtime obfuscation rewrites their href to "mailto:..." which would break
// document.querySelector otherwise). Also guard against empty/bare "#" hash and
// only preventDefault when we actually have a scroll target.
document.querySelectorAll('a[href^="#"]:not([data-email-user])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetHash = this.getAttribute('href');
        if (!targetHash || targetHash === '#' || !targetHash.startsWith('#')) return;
        const target = document.querySelector(targetHash);
        if (!target) return;
        e.preventDefault();
        const navEl = document.querySelector('.navbar, .nav');
        const navHeight = navEl ? navEl.offsetHeight : 0;
        const targetPosition = target.offsetTop - navHeight;
        history.pushState(null, null, targetHash);
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
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

// Optimized Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.about-card, .feature-card, .crew-card').forEach(card => {
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

// Dynamic CSS for navigation and animations
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
        padding: var(--s-md);
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
        color: var(--accent-cta);
    }
`;
document.head.appendChild(style);

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

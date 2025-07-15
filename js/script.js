/**
 * SeleniaProject - World-class JavaScript
 * Created by Aqua - Next Generation Computing Environment
 * 
 * This script provides interactive functionality for the SeleniaProject website
 * including smooth scrolling, responsive navigation, scroll animations, and more.
 */

// Utility functions
const utils = {
    // Debounce function for performance optimization
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    smoothScrollTo: (element, duration = 1000) => {
        const targetPosition = element.offsetTop - 80; // Account for fixed header
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        // Easing function
        const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    }
};

// Navigation functionality
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isMenuOpen = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffect();
        this.setupActiveSection();
    }

    setupEventListeners() {
        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetHref = link.getAttribute('href');
                // Handle only in-page anchors (href starting with '#')
                if (targetHref && targetHref.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetHref);
                    if (targetElement) {
                        utils.smoothScrollTo(targetElement);
                        this.closeMenu();
                    }
                } else {
                    // For external page links, close the menu and allow default navigation
                    this.closeMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
        
        // Animate hamburger
        const spans = this.hamburger.querySelectorAll('span');
        if (this.isMenuOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
        
        // Reset hamburger animation
        const spans = this.hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }

    setupScrollEffect() {
        const handleScroll = utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            // Add/remove scrolled class for navbar styling
            if (scrolled > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        
        const handleScroll = utils.throttle(() => {
            const scrollPosition = window.pageYOffset + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }
}

// Scroll animations
class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.animate-on-scroll');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupParallaxEffect();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all sections and cards
        const elementsToObserve = document.querySelectorAll(`
            .feature-card,
            .progress-item,
            .timeline-item,
            .benefit-card,
            .method-card,
            .screenshot-item,
            .about-content,
            .components-diagram
        `);

        elementsToObserve.forEach(el => {
            observer.observe(el);
        });
    }

    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.hero-background');
        
        const handleScroll = utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }
}

// Progress bar animations
class ProgressAnimations {
    constructor() {
        this.progressBars = document.querySelectorAll('.progress-fill');
        this.init();
    }

    init() {
        this.setupProgressObserver();
    }

    setupProgressObserver() {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const progress = progressBar.getAttribute('data-progress');
                    
                    // Animate progress bar
                    setTimeout(() => {
                        progressBar.style.width = `${progress}%`;
                    }, 200);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.progressBars.forEach(bar => {
            observer.observe(bar);
        });
    }
}

// Component interactions
class ComponentInteractions {
    constructor() {
        this.componentItems = document.querySelectorAll('.component-item');
        this.init();
    }

    init() {
        this.setupHoverEffects();
        this.setupClickEffects();
    }

    setupHoverEffects() {
        this.componentItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const tooltip = item.querySelector('.component-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                    tooltip.style.transform = 'translateX(-50%) translateY(10px)';
                }
            });

            item.addEventListener('mouseleave', () => {
                const tooltip = item.querySelector('.component-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.transform = 'translateX(-50%) translateY(0)';
                }
            });
        });
    }

    setupClickEffects() {
        this.componentItems.forEach(item => {
            item.addEventListener('click', () => {
                // Add click ripple effect
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(139, 92, 246, 0.6);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                const rect = item.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = rect.width / 2 - size / 2;
                const y = rect.height / 2 - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                item.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// Reward Cards interactions
class RewardCards {
    constructor() {
        this.rewardCards = document.querySelectorAll('.reward-card');
        this.init();
    }

    init() {
        this.setupCardAnimations();
        this.setupTierComparison();
        this.setupClickToExpand();
    }

    setupCardAnimations() {
        // Staggered animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 150);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.rewardCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
    }

    setupTierComparison() {
        this.rewardCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Highlight tier progression
                const currentTier = this.getTierNumber(card);
                this.rewardCards.forEach(otherCard => {
                    const otherTier = this.getTierNumber(otherCard);
                    if (otherTier <= currentTier) {
                        otherCard.style.opacity = '1';
                    } else {
                        otherCard.style.opacity = '0.6';
                    }
                });
            });

            card.addEventListener('mouseleave', () => {
                this.rewardCards.forEach(otherCard => {
                    otherCard.style.opacity = '1';
                });
            });
        });
    }

    setupClickToExpand() {
        this.rewardCards.forEach(card => {
            card.addEventListener('click', () => {
                this.expandCard(card);
            });
        });
    }

    getTierNumber(card) {
        const classList = Array.from(card.classList);
        const tierClass = classList.find(cls => cls.startsWith('tier-'));
        return tierClass ? parseInt(tierClass.split('-')[1]) : 0;
    }

    expandCard(card) {
        // Create modal for reward details
        const modal = document.createElement('div');
        modal.className = 'reward-modal';
        modal.innerHTML = `
            <div class="reward-modal-content">
                <button class="reward-modal-close">&times;</button>
                <div class="reward-modal-body">
                    ${card.innerHTML}
                    <div class="reward-modal-actions">
                        <button class="btn btn-primary">Choose This Reward</button>
                        <button class="btn btn-secondary">Learn More</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const content = modal.querySelector('.reward-modal-content');
        content.style.cssText = `
            background: var(--card-bg);
            border-radius: 20px;
            border: 2px solid var(--border-color);
            backdrop-filter: blur(20px);
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        const closeBtn = modal.querySelector('.reward-modal-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 2rem;
            cursor: pointer;
            z-index: 2;
        `;

        const actions = modal.querySelector('.reward-modal-actions');
        actions.style.cssText = `
            padding: var(--spacing-xl);
            display: flex;
            gap: var(--spacing-md);
            justify-content: center;
            border-top: 1px solid var(--border-color);
        `;

        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);

        // Close handlers
        const closeModal = () => {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
}

// Screenshot gallery
class ScreenshotGallery {
    constructor() {
        this.screenshots = document.querySelectorAll('.screenshot-img');
        this.init();
    }

    init() {
        this.setupLightbox();
    }

    setupLightbox() {
        this.screenshots.forEach(img => {
            img.addEventListener('click', () => {
                this.openLightbox(img);
            });
        });
    }

    openLightbox(img) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${img.src}" alt="${img.alt}">
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const content = lightbox.querySelector('.lightbox-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const lightboxImg = lightbox.querySelector('img');
        lightboxImg.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
        `;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(lightbox);
        
        // Animate in
        setTimeout(() => {
            lightbox.style.opacity = '1';
        }, 10);
        
        // Close handlers
        const closeLightbox = () => {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(lightbox);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            scrollEvents: 0,
            clickEvents: 0
        };
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.setupEventTracking();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`Page loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
        });
    }

    setupEventTracking() {
        let scrollCount = 0;
        let clickCount = 0;

        const trackScroll = utils.throttle(() => {
            scrollCount++;
            this.metrics.scrollEvents = scrollCount;
        }, 100);

        const trackClick = () => {
            clickCount++;
            this.metrics.clickEvents = clickCount;
        };

        window.addEventListener('scroll', trackScroll);
        document.addEventListener('click', trackClick);
    }

    getMetrics() {
        return this.metrics;
    }
}

// Accessibility enhancements
class AccessibilityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIALabels();
    }

    setupKeyboardNavigation() {
        // Tab navigation for components
        const focusableElements = document.querySelectorAll(`
            .nav-link,
            .btn,
            .component-item,
            .screenshot-img,
            .hamburger
        `);

        focusableElements.forEach(element => {
            element.setAttribute('tabindex', '0');
            
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    }

    setupFocusManagement() {
        // Skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-purple);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    setupARIALabels() {
        // Add ARIA labels to interactive elements
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            hamburger.setAttribute('aria-expanded', 'false');
        }

        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-valuenow', progress);
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', '100');
        });
    }
}

// Error handling and logging
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupConsoleLogging();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.logError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.logError(e.reason);
        });
    }

    setupConsoleLogging() {
        // Enhanced console logging for development
        if (process?.env?.NODE_ENV === 'development') {
            console.log('%c🚀 SeleniaProject Website Initialized', 'color: #8B5CF6; font-size: 16px; font-weight: bold;');
            console.log('%c✨ Created by Aqua - Next Generation Computing Environment', 'color: #6B46C1; font-size: 12px;');
        }
    }

    logError(error) {
        // In production, you would send this to your error tracking service
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // For now, just log to console
        console.error('Error logged:', errorData);
    }
}

// Main application initialization
class SeleniaProjectApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.navigation = new Navigation();
            this.components.scrollAnimations = new ScrollAnimations();
            this.components.progressAnimations = new ProgressAnimations();
            this.components.componentInteractions = new ComponentInteractions();
            this.components.screenshotGallery = new ScreenshotGallery();
            this.components.rewardCards = new RewardCards();
            this.components.performanceMonitor = new PerformanceMonitor();
            this.components.accessibilityEnhancements = new AccessibilityEnhancements();
            this.components.errorHandler = new ErrorHandler();

            // Set up additional features
            this.setupSmoothScrolling();
            this.setupFormValidation();
            this.setupDynamicContent();
            this.setupServiceWorker();

            console.log('✅ SeleniaProject website fully initialized');
        } catch (error) {
            console.error('❌ Error initializing SeleniaProject website:', error);
        }
    }

    setupSmoothScrolling() {
        // Smooth scrolling for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    utils.smoothScrollTo(target);
                }
            });
        });
    }

    setupFormValidation() {
        // Enhanced form validation (if forms are added later)
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }

    validateForm(form) {
        // Form validation logic
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    setupDynamicContent() {
        // Dynamic content loading and updates
        this.updateCopyright();
        this.setupLazyLoading();
    }

    updateCopyright() {
        const copyrightElement = document.querySelector('.footer-content p');
        if (copyrightElement) {
            const currentYear = new Date().getFullYear();
            copyrightElement.textContent = `© ${currentYear} SeleniaProject. All rights reserved.`;
        }
    }

    setupLazyLoading() {
        // Lazy loading for images
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    setupServiceWorker() {
        // Service worker for offline functionality (progressive web app)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // Public API methods
    getComponent(name) {
        return this.components[name];
    }

    getMetrics() {
        return this.components.performanceMonitor?.getMetrics() || {};
    }

    scrollToSection(sectionId) {
        const section = document.querySelector(`#${sectionId}`);
        if (section) {
            utils.smoothScrollTo(section);
        }
    }
}

// Initialize the application
const seleniaApp = new SeleniaProjectApp();

// Make app globally available for debugging
window.SeleniaProject = seleniaApp;

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .skip-link:focus {
        top: 6px !important;
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeleniaProjectApp;
} 
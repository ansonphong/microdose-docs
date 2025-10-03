// Microdose VR Manual - Pure Tailwind Implementation

class MicrodoseVRManual {
    constructor() {
        this.isDarkMode = true; // Default to dark mode
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.loadThemeFromStorage();
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.updateThemeIcons();
    }

    // Theme Management
    loadThemeFromStorage() {
        const savedTheme = localStorage.getItem('microdose-vr-theme');
        if (savedTheme) {
            this.isDarkMode = savedTheme === 'dark';
        }
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.saveThemeToStorage();
        this.updateThemeIcons();
    }

    applyTheme() {
        const html = document.documentElement;
        const mainTitle = document.getElementById('main-title');
        
        if (this.isDarkMode) {
            html.classList.add('dark');
            html.classList.remove('light');
            // Switch to more saturated gradient for dark mode
            if (mainTitle) {
                mainTitle.classList.remove('microdose-gradient');
                mainTitle.classList.add('microdose-gradient-dark');
            }
        } else {
            html.classList.remove('dark');
            html.classList.add('light');
            // Switch to regular gradient for light mode
            if (mainTitle) {
                mainTitle.classList.remove('microdose-gradient-dark');
                mainTitle.classList.add('microdose-gradient');
            }
        }
    }

    saveThemeToStorage() {
        localStorage.setItem('microdose-vr-theme', this.isDarkMode ? 'dark' : 'light');
    }

    updateThemeIcons() {
        const desktopIcon = document.getElementById('theme-icon');
        const mobileIcon = document.getElementById('mobile-theme-icon');
        const mobileText = document.getElementById('mobile-theme-text');

        const icon = this.isDarkMode ? '☀️' : '🌙';
        const text = this.isDarkMode ? 'Light Mode' : 'Dark Mode';

        if (desktopIcon) desktopIcon.textContent = icon;
        if (mobileIcon) mobileIcon.textContent = icon;
        if (mobileText) mobileText.textContent = text;
    }

    // Mobile Menu Management
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const mobileMenu = document.getElementById('mobile-menu');
        const menuButton = document.getElementById('mobile-menu-button');

        if (this.mobileMenuOpen) {
            // Show menu with animation
            mobileMenu.classList.remove('hidden');
            // Force a reflow to ensure the element is rendered
            mobileMenu.offsetHeight;
            // Add animation classes
            mobileMenu.classList.remove('opacity-0', 'scale-95', 'translate-y-[-10px]');
            mobileMenu.classList.add('opacity-100', 'scale-100', 'translate-y-0');
            menuButton.setAttribute('aria-expanded', 'true');
        } else {
            // Hide menu with animation
            mobileMenu.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
            mobileMenu.classList.add('opacity-0', 'scale-95', 'translate-y-[-10px]');
            menuButton.setAttribute('aria-expanded', 'false');
            // Hide after animation completes
            setTimeout(() => {
                if (!this.mobileMenuOpen) {
                    mobileMenu.classList.add('hidden');
                }
            }, 200);
        }
    }

    closeMobileMenu() {
        if (this.mobileMenuOpen) {
            this.mobileMenuOpen = false;
            const mobileMenu = document.getElementById('mobile-menu');
            const menuButton = document.getElementById('mobile-menu-button');
            
            // Hide menu with animation
            mobileMenu.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
            mobileMenu.classList.add('opacity-0', 'scale-95', 'translate-y-[-10px]');
            menuButton.setAttribute('aria-expanded', 'false');
            // Hide after animation completes
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 200);
        }
    }

    // Smooth Scrolling for Navigation Links
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    this.closeMobileMenu();
                }
            });
        });
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Theme toggle buttons
        const themeToggle = document.getElementById('theme-toggle');
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu button
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            
            if (this.mobileMenuOpen && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuButton.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            // Close mobile menu on desktop breakpoint
            if (window.innerWidth >= 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Quick access keys
            if (e.altKey && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const sections = ['stylus', 'gamepad', 'vr', 'cinematic', 'dome'];
                const sectionId = sections[parseInt(e.key) - 1];
                const targetElement = document.getElementById(sectionId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }

            // Theme toggle with Ctrl+Shift+T
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // Utility method to highlight active section in navigation
    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        navLinks.forEach(link => {
            // Remove active classes
            link.classList.remove('bg-gray-900/10', 'dark:bg-white/20', 'text-gray-900', 'dark:text-white');
            
            // Add active classes to current section
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('bg-gray-900/10', 'dark:bg-white/20', 'text-gray-900', 'dark:text-white');
            }
        });
    }

    // Initialize scroll-based active section highlighting
    initScrollHighlighting() {
        window.addEventListener('scroll', () => {
            this.highlightActiveSection();
        });
        
        // Initial highlight
        this.highlightActiveSection();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MicrodoseVRManual();
    
    // Initialize scroll highlighting after a brief delay to ensure layout is complete
    setTimeout(() => {
        app.initScrollHighlighting();
    }, 100);
    
    // Add interactive feedback for key buttons
    document.querySelectorAll('[class*="bg-gray-700"]').forEach(keyBtn => {
        if (keyBtn.classList.contains('font-mono')) {
            keyBtn.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            // Add transition class
            keyBtn.classList.add('transition-transform', 'duration-150', 'cursor-pointer');
        }
    });
    
    console.log('🌈 Microdose VR Manual initialized successfully!');
});
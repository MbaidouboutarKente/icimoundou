/**
 * main.js - Fonctions globales du site
 * Menu burger, slider partagé, animations, utilitaires
 */

// ==================== MENU BURGER ====================
document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            burgerBtn.classList.toggle('active');
            
            // Animation du burger (transforme en X)
            const lines = burgerBtn.querySelectorAll('.burger-line');
            if (burgerBtn.classList.contains('active')) {
                if (lines[0]) lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (lines[1]) lines[1].style.opacity = '0';
                if (lines[2]) lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                if (lines[0]) lines[0].style.transform = 'none';
                if (lines[1]) lines[1].style.opacity = '1';
                if (lines[2]) lines[2].style.transform = 'none';
            }
        });
    }
    
    // Fermer le menu au clic sur un lien (mobile)
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                if (burgerBtn) burgerBtn.classList.remove('active');
                const lines = burgerBtn?.querySelectorAll('.burger-line');
                if (lines) {
                    lines.forEach(line => {
                        line.style.transform = 'none';
                        line.style.opacity = '1';
                    });
                }
            }
        });
    });
    
    // Gestion du redimensionnement : réinitialiser le menu si on passe en desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (burgerBtn) burgerBtn.classList.remove('active');
            const lines = burgerBtn?.querySelectorAll('.burger-line');
            if (lines) {
                lines.forEach(line => {
                    line.style.transform = 'none';
                    line.style.opacity = '1';
                });
            }
        }
    });
});

// ==================== ANIMATIONS AU SCROLL ====================
// Animation d'apparition des éléments au scroll (fade-in)
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.talent-card, .section, .footer-col');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Appliquer l'animation quand les éléments sont prêts
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initScrollAnimations, 100);
});

// Fonction pour ajouter la classe animated qui révèle l'élément
// (à appeler après ajout dynamique d'éléments)
function revealAnimatedElements() {
    const elements = document.querySelectorAll('.talent-card, .section, .footer-col');
    elements.forEach(el => {
        if (!el.classList.contains('animated')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(el);
        }
    });
}

// ==================== SLIDER GÉNÉRIQUE (réutilisable) ====================
class GenericSlider {
    constructor(containerId, trackId, prevBtnId, nextBtnId, itemsPerView = 3) {
        this.container = document.getElementById(containerId);
        this.track = document.getElementById(trackId);
        this.prevBtn = document.getElementById(prevBtnId);
        this.nextBtn = document.getElementById(nextBtnId);
        this.itemsPerView = itemsPerView;
        this.currentIndex = 0;
        this.items = [];
        this.totalItems = 0;
        
        this.init();
    }
    
    init() {
        if (!this.track) return;
        
        // Récupérer les cartes existantes ou attendre chargement dynamique
        this.updateItems();
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
    }
    
    updateItems() {
        if (!this.track) return;
        this.items = Array.from(this.track.children);
        this.totalItems = this.items.length;
        this.updateButtonsState();
    }
    
    updateButtonsState() {
        if (this.prevBtn) {
            this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
            this.prevBtn.style.cursor = this.currentIndex === 0 ? 'not-allowed' : 'pointer';
        }
        if (this.nextBtn) {
            const maxIndex = Math.max(0, this.totalItems - this.itemsPerView);
            this.nextBtn.style.opacity = this.currentIndex >= maxIndex ? '0.5' : '1';
            this.nextBtn.style.cursor = this.currentIndex >= maxIndex ? 'not-allowed' : 'pointer';
        }
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.slide();
        }
    }
    
    next() {
        const maxIndex = Math.max(0, this.totalItems - this.itemsPerView);
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.slide();
        }
    }
    
    slide() {
        if (!this.track) return;
        const cardWidth = this.items[0]?.offsetWidth || 0;
        const gap = 30; // correspond au gap CSS
        const offset = -this.currentIndex * (cardWidth + gap);
        this.track.style.transform = `translateX(${offset}px)`;
        this.updateButtonsState();
    }
    
    // Recalculer après ajout dynamique de contenu
    refresh() {
        this.updateItems();
        this.currentIndex = 0;
        this.slide();
    }
}

// Exporter pour usage dans d'autres fichiers (si module)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GenericSlider, revealAnimatedElements };
}

// ==================== UTILITAIRES GLOBAUX ====================
// Fonction de chargement lazy des images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Gestion du scroll vers les ancres (smooth)
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Initialisation des utilitaires
document.addEventListener('DOMContentLoaded', () => {
    initLazyLoading();
    initSmoothScroll();
});
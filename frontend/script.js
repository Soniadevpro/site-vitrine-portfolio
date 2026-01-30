// Attendre que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', function() {

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    // Vérifier la préférence sauvegardée
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);

    darkModeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Menu Hamburger
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Fermer le menu mobile quand on clique sur un lien
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Fonction pour créer une notification toast
    function showToast(title, message, type = 'success') {
        // Supprimer les anciens toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(t => t.remove());
        
        // Créer l'élément toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icône selon le type
        const icon = type === 'success' 
            ? '✓' 
            : '✗';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
            <div class="toast-progress"></div>
        `;
        
        document.body.appendChild(toast);
        
        // Animer l'apparition
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Bouton fermer
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        });
        
        // Disparition automatique après 5 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    // Formulaire de contact
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Désactiver le bouton pendant l'envoi
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Envoi en cours...';
            submitButton.disabled = true;
            
            try {
                const response = await fetch('http://127.0.0.1:8000/api/contact/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);
                
                if (response.ok && data.success) {
                    console.log('✅ Succès détecté, affichage du toast');
                    
                    // Afficher la notification de succès
                    showToast(
                        'Message envoyé !', 
                        'Je vous répondrai dans les plus brefs délais.',
                        'success'
                    );
                    
                    // Réinitialiser le formulaire
                    contactForm.reset();
                    
                    // Cacher l'ancien message s'il existe
                    if (formMessage) {
                        formMessage.style.display = 'none';
                    }
                } else {
                    console.log('❌ Erreur ou succès non détecté');
                    // Afficher les erreurs de validation
                    let errorMessage = 'Veuillez vérifier les champs du formulaire.';
                    if (data.errors) {
                        errorMessage = Object.values(data.errors).flat().join(', ');
                    }
                    throw new Error(errorMessage);
                }
                
            } catch (error) {
                console.log('❌ Erreur catch:', error);
                // Notification d'erreur
                showToast(
                    'Erreur d\'envoi',
                    error.message || 'Une erreur est survenue. Veuillez réessayer.',
                    'error'
                );
                
                console.error('Erreur:', error);
            } finally {
                // Réactiver le bouton
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
            
            return false;
        });
    }

    // Animation au scroll pour les éléments
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer tous les éléments portfolio
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });

    // Smooth scroll pour les ancres (mais pas pour le formulaire)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ne pas intercepter si c'est juste un # (évite conflit avec formulaire)
            if (href === '#') {
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

}); // ⬅️ FIN du DOMContentLoaded
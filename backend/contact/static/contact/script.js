console.log('✅ Script chargé !');

// =======================
// Dark Mode Toggle
// =======================
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;

// Vérifier la préférence sauvegardée
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    const theme = htmlElement.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';

    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// =======================
// Menu Hamburger
// =======================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
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
}

// =======================
// Toast Notification
// =======================
function showToast(title, message, type = 'success') {
  console.log('🔔 showToast appelé:', { title, message, type });

  // Supprimer les anciens toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(t => t.remove());

  // Créer l'élément toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Icône selon le type
  const icon = type === 'success' ? '✓' : '✗';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Fermer">×</button>
    <div class="toast-progress"></div>
  `;

  document.body.appendChild(toast);

  // Animer l'apparition
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Bouton fermer
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    });
  }

  // Disparition automatique après 5 secondes
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// =======================
// Formulaire de contact
// =======================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

// ✅ Mets ici l’URL de ton endpoint DRF
const API_URL = '/api/contact/';



console.log('📋 Formulaire trouvé:', contactForm);

if (contactForm) {
  console.log('✅ Ajout du listener sur le formulaire');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('📤 Formulaire soumis !');

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : 'Envoyer le message';

    // Récupération des champs
    const formData = {
      name: document.getElementById('name')?.value?.trim() || '',
      email: document.getElementById('email')?.value?.trim() || '',
      subject: document.getElementById('subject')?.value?.trim() || '',
      message: document.getElementById('message')?.value?.trim() || ''
    };

    console.log('📤 Données du formulaire:', formData);

    // Désactiver le bouton pendant l'envoi
    if (submitButton) {
      submitButton.textContent = 'Envoi en cours...';
      submitButton.disabled = true;
    }

    try {
      console.log('📡 Envoi de la requête vers:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      // ✅ Essayer de lire du JSON, sinon fallback texte
      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('⚠️ Réponse non JSON reçue:', text);
        throw new Error("Réponse serveur inattendue (pas du JSON).");
      }

      console.log('📡 Response data:', data);
      console.log('✅ data.success:', data?.success, 'type:', typeof data?.success);

      // ✅ Détection robuste du succès
      const isSuccess =
        response.ok &&
        (data?.success === true || data?.success === 'true' || data?.success === 1 || data?.success === '1');

      if (isSuccess) {
        console.log('✅ Succès détecté ! Appel de showToast...');

        showToast(
          'Message envoyé !',
          data?.message || 'Je vous répondrai dans les plus brefs délais.',
          'success'
        );

        // Réinitialiser le formulaire
        contactForm.reset();

        // Cacher l'ancien message s'il existe
        if (formMessage) {
          formMessage.style.display = 'none';
        }

        return;
      }

      // Sinon, on traite les erreurs
      let errorMessage = 'Veuillez vérifier les champs du formulaire.';
      if (data?.errors) {
        errorMessage = Object.values(data.errors).flat().join(', ');
      } else if (data?.message && !isSuccess) {
        // Si l’API renvoie un message mais success n'est pas détecté
        errorMessage = data.message;
      }

      throw new Error(errorMessage);

    } catch (error) {
      console.log('❌ Erreur catch:', error);

      showToast(
        "Erreur d'envoi",
        error?.message || 'Une erreur est survenue. Veuillez réessayer.',
        'error'
      );

      console.error('Erreur complète:', error);

    } finally {
      // Réactiver le bouton
      if (submitButton) {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    }

    return false;
  });

} else {
  console.error('❌ Formulaire non trouvé !');
}

// =======================
// Animation au scroll pour les éléments portfolio
// =======================
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

document.querySelectorAll('.portfolio-item').forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = 'all 0.6s ease';
  observer.observe(item);
});

// =======================
// Smooth scroll pour les ancres
// =======================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

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

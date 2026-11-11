const supportedLanguages = ['fr', 'en', 'nl'];
const defaultLanguage = 'fr';
let currentTranslations = {}; // Stocke les traductions actives en mémoire

function flattenTranslations(source, target = {}) {
  if (!source || typeof source !== 'object') {
    return target;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenTranslations(value, target);
      return;
    }

    target[key] = value;
  });

  return target;
}

function getInitialLanguage() {
  const savedLang = localStorage.getItem('preferredLang');
  if (savedLang && supportedLanguages.includes(savedLang)) {
    return savedLang;
  }
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  return supportedLanguages.includes(browserLang) ? browserLang : defaultLanguage;
}

// Fonction utilitaire pour récupérer une traduction dans votre JS
function t(key) {
  return currentTranslations[key] || key;
}

// Met à jour la classe CSS ".active" sur le bon bouton
// ai mis à jour la class native de ce script 'lang-btn' en 'lang-option' conformément à mon code HTML. Si problème, remettre class native
function updateActiveButton(lang) {
  document.querySelectorAll('.lang-option').forEach((btn) => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function loadTranslations(lang, applyToDom = true) {
  try {
    const response = await fetch(`./locales/${lang}.json`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading ${lang}.json`);
    }

    const rawTranslations = await response.json();
    currentTranslations = flattenTranslations(rawTranslations);

    // On met à jour le HTML seulement si nécessaire
    if (applyToDom) {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (currentTranslations[key]) el.textContent = currentTranslations[key];
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (currentTranslations[key]) el.setAttribute('placeholder', currentTranslations[key]);
      });

      document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
        const key = el.getAttribute('data-i18n-alt');
        if (currentTranslations[key]) el.setAttribute('alt', currentTranslations[key]);
      });

      document.querySelectorAll('[data-i18n-content]').forEach((el) => {
        const key = el.getAttribute('data-i18n-content');
        if (currentTranslations[key]) el.setAttribute('content', currentTranslations[key]);
      });

      document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const key = el.getAttribute('data-i18n-title');
        if (currentTranslations[key]) el.setAttribute('title', currentTranslations[key]);
      });
    }

    document.documentElement.lang = lang;
    updateActiveButton(lang);
  } catch (error) {
    console.error('Erreur de chargement des traductions :', error);
  }
}

function changeLanguage(lang) {
  if (!supportedLanguages.includes(lang)) return;
  localStorage.setItem('preferredLang', lang);
  loadTranslations(lang, true);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  const initialLang = getInitialLanguage();
  // Si la langue est le français, on charge le JSON en arrière-plan pour la fonction t()
  // sans réécrire le HTML déjà en français
  const shouldUpdateDom = initialLang !== defaultLanguage;
  loadTranslations(initialLang, shouldUpdateDom);
});

// Exemple d'utilisation avec votre formulaire de contact
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const feedback = document.getElementById('form-feedback');

  if (!feedback) {
    return;
  }
  
  // Utilise la fonction t() pour afficher le message dans la langue active
  feedback.textContent = t('form_success');
  feedback.style.color = 'green';
});

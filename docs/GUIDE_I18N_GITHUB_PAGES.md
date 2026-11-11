# Guide Récapitulatif : Git & Landing Page Multilingue (Vanilla JS + GitHub Pages)

Ce guide regroupe toutes les commandes Git essentielles ainsi que le code complet prêt à l'emploi pour créer une landing page multilingue en JavaScript pur hébergée sur GitHub Pages.

---

## 1. Commandes Git pour gérer une nouvelle branche

* **Créer une branche en local et y basculer immédiatement :**
  ```bash
  git switch -c <nom-de-la-branche>
  ```
* **Créer et publier la branche sur GitHub (dépôt distant) :**
  ```bash
  git push -u origin <nom-de-la-branche>
  ```
* **Enregistrer et envoyer ses nouveaux fichiers :**
  ```bash
  git add .
  git commit -m "Ajout du système multilingue i18n"
  git push
  ```

---

## 2. Architecture du projet (GitHub Pages)

GitHub Pages héberge uniquement des fichiers statiques. Le JavaScript pur (Vanilla JS) fonctionne nativement sans étape de compilation (*build*), et détecte la langue côté client via `navigator.language`.

```text
mon-projet/
├── index.html
├── script.js
└── locales/
    ├── fr.json
    └── en.json
```

---

## 3. Fichiers de traduction (JSON)

### `locales/fr.json`
*(Indispensable même si le français est la langue par défaut dans le HTML, afin de permettre le retour au français et la traduction des messages dynamiques JS).*

```json
{
  "page_title": "Ma Landing Page - Accueil",
  "meta_description": "Découvrez notre solution rapide et efficace.",
  "nav_about": "À propos",
  "hero_title": "Bienvenue sur notre produit",
  "hero_subtitle": "La solution simple et rapide pour vos besoins.",
  "cta_button": "Commencer maintenant",
  "email_placeholder": "Entrez votre adresse email...",
  "hero_img_alt": "Illustration de notre application sur ordinateur",
  "form_success": "Merci ! Votre message a bien été envoyé.",
  "form_error": "Veuillez remplir tous les champs correctement."
}
```

### `locales/en.json`

```json
{
  "page_title": "My Landing Page - Home",
  "meta_description": "Discover our fast and efficient solution.",
  "nav_about": "About",
  "hero_title": "Welcome to our product",
  "hero_subtitle": "The simple and fast solution for your needs.",
  "cta_button": "Get started now",
  "email_placeholder": "Enter your email address...",
  "hero_img_alt": "Illustration of our application on a laptop",
  "form_success": "Thank you! Your message has been sent.",
  "form_error": "Please fill in all fields correctly."
}
```

---

## 4. Page HTML complète (`index.html`)

### Attributs personnalisés utilisés :
* `data-i18n` : Texte standard (`<title>`, `<h1>`, `<p>`, `<button>`, `<a>`).
* `data-i18n-placeholder` : Attribut `placeholder` des champs de formulaire.
* `data-i18n-alt` : Attribut `alt` des images.
* `data-i18n-content` : Attribut `content` des balises `<meta>`.
* `data-lang` : Identifie les boutons de langue pour appliquer automatiquement la classe CSS `.active`.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-i18n="page_title">Ma Landing Page - Accueil</title>
  <meta name="description" content="Découvrez notre solution rapide et efficace." data-i18n-content="meta_description">
  
  <style>
    /* Style par défaut des boutons de langue */
    .lang-btn {
      padding: 5px 10px;
      cursor: pointer;
      background: transparent;
      border: 1px solid #ccc;
    }
    /* Style appliqué automatiquement sur la langue active */
    .lang-btn.active {
      background: #007bff;
      color: white;
      font-weight: bold;
      border-color: #007bff;
    }
  </style>
</head>
<body>

  <header>
    <nav>
      <a href="#about" data-i18n="nav_about">À propos</a>
      <div>
        <button class="lang-btn" data-lang="fr" onclick="changeLanguage('fr')">FR</button>
        <button class="lang-btn" data-lang="en" onclick="changeLanguage('en')">EN</button>
      </div>
    </nav>
  </header>

  <main>
    <h1 data-i18n="hero_title">Bienvenue sur notre produit</h1>
    <p data-i18n="hero_subtitle">La solution simple et rapide pour vos besoins.</p>
    <button data-i18n="cta_button">Commencer maintenant</button>

    <img src="app.png" alt="Illustration de notre application sur ordinateur" data-i18n-alt="hero_img_alt">

    <!-- Formulaire de contact -->
    <form id="contact-form">
      <input type="email" id="email-input" placeholder="Entrez votre adresse email..." data-i18n-placeholder="email_placeholder" required>
      <button type="submit" data-i18n="cta_button">Envoyer</button>
      <p id="form-feedback"></p>
    </form>
  </main>

  <script src="script.js"></script>
</body>
</html>
```

---

## 5. Script JavaScript complet (`script.js`)

Ce script gère :
1. La détection de langue (priorité : choix sauvegardé dans `localStorage` > langue du navigateur > langue par défaut).
2. L'optimisation au premier chargement (évite de réécrire le DOM si le français est déjà affiché, tout en chargeant `fr.json` en arrière-plan pour la fonction `t()`).
3. L'ajout de la classe CSS `.active` sur le bouton correspondant à la langue active.
4. La fonction utilitaire `t('cle')` pour traduire les messages dynamiques (comme les confirmations de formulaire).

```javascript
const supportedLanguages = ['fr', 'en'];
const defaultLanguage = 'fr';
let currentTranslations = {}; // Stocke les traductions actives en mémoire

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

// Met à jour la classe CSS ".active" sur le bon bouton de langue
function updateActiveButton(lang) {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function loadTranslations(lang, applyToDom = true) {
  try {
    // Chemin relatif "./locales/" indispensable pour GitHub Pages
    const response = await fetch(`./locales/${lang}.json`);
    currentTranslations = await response.json();

    if (applyToDom) {
      // 1. Texte standard (y compris <title>)
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (currentTranslations[key]) el.textContent = currentTranslations[key];
      });

      // 2. Attribut placeholder (formulaires)
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (currentTranslations[key]) el.setAttribute('placeholder', currentTranslations[key]);
      });

      // 3. Attribut alt (images)
      document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
        const key = el.getAttribute('data-i18n-alt');
        if (currentTranslations[key]) el.setAttribute('alt', currentTranslations[key]);
      });

      // 4. Attribut content (balises <meta>)
      document.querySelectorAll('[data-i18n-content]').forEach((el) => {
        const key = el.getAttribute('data-i18n-content');
        if (currentTranslations[key]) el.setAttribute('content', currentTranslations[key]);
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
  const shouldUpdateDom = initialLang !== defaultLanguage;
  loadTranslations(initialLang, shouldUpdateDom);
});

// Exemple d'utilisation avec le formulaire de contact
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const feedback = document.getElementById('form-feedback');
  
  feedback.textContent = t('form_success');
  feedback.style.color = 'green';
});
```

---

## 6. Bonnes pratiques et astuces

* **Tests en local** : Utilisez l'extension **Live Server** sur VS Code ou la commande `npx serve` dans votre terminal (les navigateurs bloquent `fetch()` si vous ouvrez `index.html` directement via `file://`).
* **Balises HTML dans les traductions** : Si une traduction contient du HTML (ex. : un lien `<a>` ou du gras `<strong>`), remplacez `el.textContent` par `el.innerHTML` dans la première boucle de `loadTranslations()`.

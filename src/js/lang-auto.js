(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    let currentLang = localStorage.getItem('lang') || 'es';

    async function loadLanguage(lang) {
      try {
        const response = await fetch(`/lang/${lang}.json`);
        return await response.json();
      } catch (err) {
        console.error(`Error al cargar ${lang}.json:`, err);
        return {};
      }
    }

    async function applyTranslations(langData) {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (langData[key]) el.textContent = langData[key];
      });
    }

    async function setLanguage(lang) {
      currentLang = lang;
      localStorage.setItem('lang', lang);
      const langData = await loadLanguage(lang);
      applyTranslations(langData);

      // Cambiar texto del botón de idioma
      langBtn.textContent = lang === 'es' ? 'Español 🇪🇸' : 'English 🇬🇧';
    }

    langBtn.addEventListener('click', async () => {
      const newLang = currentLang === 'es' ? 'en' : 'es';
      await setLanguage(newLang);
    });

    // Idioma inicial
    setLanguage(currentLang);
  });
})();

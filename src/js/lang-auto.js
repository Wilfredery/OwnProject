(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'es';
 
    async function loadLanguage(lang) {
      try {
        const res = await fetch(`/lang/${lang}.json`);
        return await res.json();
      } catch (e) {
        console.error(`Error cargando ${lang}.json`, e);
        return {};
      }
    }

    function applyTranslations(langData) {
      // Texto normal
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (langData[key]) el.textContent = langData[key];
      });

      // Placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (langData[key]) el.placeholder = langData[key];
      });

      // Title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (langData[key]) el.title = langData[key];
      });

      // Alt (imágenes)
      document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.getAttribute('data-i18n-alt');
        if (langData[key]) el.alt = langData[key];
      });

      // Value (inputs tipo button o submit)
      document.querySelectorAll('[data-i18n-value]').forEach(el => {
        const key = el.getAttribute('data-i18n-value');
        if (langData[key]) el.value = langData[key];
      });
    }

    async function setLanguage(lang) {
      currentLang = lang;
      localStorage.setItem('lang', lang);
      const langData = await loadLanguage(lang);
      applyTranslations(langData);

      if (langBtn) {
        langBtn.textContent = lang === 'es' ? 'Español 🇪🇸' : 'English 🇬🇧';
      }
    }

    // ✅ Solo si hay botón de cambiar idioma
    if (langBtn) {
      langBtn.addEventListener('click', async () => {
        const newLang = currentLang === 'es' ? 'en' : 'es';
        await setLanguage(newLang);


        if(typeof Swal !== "undefined") {
          Swal.fire({
            title: newLang === 'es' ? 'Idioma actualizado' : 'Language updated',
            toast: true,
            position: 'top',
            icon: 'success',
            showConfirmButton: false,
            timer: 1600,
            timerProgressBar: true,
            customClass: {
              popup: 'minimal-alert'
            }
          });
        } else {
          console.warn("SweetAlert no está cargado");
        }
      });
    }

    // ✅ Siempre cargar idioma seleccionado
    setLanguage(currentLang);
  });
})();

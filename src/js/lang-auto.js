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

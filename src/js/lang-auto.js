// src/js/lang-auto.js
import Swal from "sweetalert2";

document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('lang-toggle');
  let currentLang = localStorage.getItem('lang') || 'es';
  let currentLangData = {};

  // ========================================
  // 🔵 CARGAR ARCHIVO DE IDIOMA
  // ========================================
  async function loadLanguage(lang) {
    try {
      const res = await fetch(`/lang/${lang}.json`);
      return await res.json();
    } catch (e) {
      console.error(`Error cargando ${lang}.json`, e);
      return {};
    }
  }

  // ========================================
  // 🔵 APLICAR TRADUCCIONES
  // ========================================
  function applyTranslations(langData, root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (langData[key]) el.textContent = langData[key];
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (langData[key]) el.placeholder = langData[key];
    });

    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (langData[key]) el.title = langData[key];
    });

    root.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (langData[key]) el.alt = langData[key];
    });

    root.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      if (langData[key]) el.value = langData[key];
    });
  }

  // ========================================
  // 🔵 OBSERVADOR PARA CONTENIDO DINÁMICO
  // ========================================
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          applyTranslations(currentLangData, node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // ========================================
  // 🔵 CAMBIAR IDIOMA
  // ========================================
  async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    currentLangData = await loadLanguage(lang);
    applyTranslations(currentLangData);

    if (langBtn) {
      langBtn.textContent = lang === 'es' ? 'Español 🇪🇸' : 'English 🇬🇧';
    }
  }

  // ========================================
  // 🔵 BOTÓN IDIOMA
  // ========================================
  if (langBtn) {
    langBtn.addEventListener('click', async () => {
      const newLang = currentLang === 'es' ? 'en' : 'es';
      await setLanguage(newLang);

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
    });
  }

  // ========================================
  // 🔵 CARGAR IDIOMA AL INICIAR
  // ========================================
  (async () => {
    currentLangData = await loadLanguage(currentLang);
    applyTranslations(currentLangData);

    // Exponer para otros scripts
    window.currentLangData = currentLangData;
    window.applyTranslations = applyTranslations;
  })();
});

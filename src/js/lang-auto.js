import Swal from "sweetalert2";
import { setLang, getLang, applyTranslations } from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("lang-toggle");
  if (!langBtn) return;

  /* 🔄 Observador solo para nodos nuevos */
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          applyTranslations(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  /* 🧠 Sincroniza el botón con el idioma real */
  function syncLangButton() {
    const lang = getLang();
    langBtn.textContent =
      lang === "es" ? "Español 🇪🇸" : "English 🇬🇧";
  }

  /* 🌍 Estado inicial */
  applyTranslations();
  syncLangButton();

  /* 🔁 Toggle REAL */
  langBtn.addEventListener("click", () => {
    const current = getLang();          // ✅ estado real
    const newLang = current === "es" ? "en" : "es";

    setLang(newLang);                  // 🔥 cambia idioma global
    window.updateGuideImages?.();     // 🖼️ cambia imágenes del guide
    syncLangButton();                  // 🔄 refleja estado

    Swal.fire({
      title: newLang === "es"
        ? "Idioma actualizado"
        : "Language updated",
      toast: true,
      position: "top",
      icon: "success",
      showConfirmButton: false,
      timer: 1600,
      timerProgressBar: true,
      customClass: {
        popup: "minimal-alert"
      }
    });
  });
});
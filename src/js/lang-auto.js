import Swal from "sweetalert2";
import { setLang, getLang, applyTranslations } from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("lang-toggle");
  if (!langBtn) return;

  /* 🔄 Observador SOLO para nodos relevantes */
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (
          node.nodeType === 1 &&
          (
            node.hasAttribute("data-i18n") ||
            node.hasAttribute("data-i18n-placeholder") ||
            node.hasAttribute("data-i18n-title") ||
            node.hasAttribute("data-i18n-alt") ||
            node.hasAttribute("data-i18n-value") ||
            node.querySelector?.(
              "[data-i18n], [data-i18n-placeholder], [data-i18n-title], [data-i18n-alt], [data-i18n-value]"
            )
          )
        ) {
          applyTranslations(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  /* 🧠 Sincroniza el botón con el idioma REAL */
  function syncLangButton() {
    const lang = getLang();
    langBtn.textContent =
      lang === "es" ? "Español 🇪🇸" : "English 🇬🇧";
  }

  /* 🌍 Estado inicial */
  applyTranslations();
  syncLangButton();

  /* 🔒 Anti-spam */
  let switching = false;

  /* 🔁 Toggle REAL */
  langBtn.addEventListener("click", async () => {
    if (switching) return;
    switching = true;

    const current = getLang();                 // ✅ estado real
    const newLang = current === "es" ? "en" : "es";

    setLang(newLang);                          // 🔥 cambia idioma global
    window.updateGuideImages?.();             // 🖼️ cambia imágenes del guide
    syncLangButton();                          // 🔄 refleja estado

    await Swal.fire({
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

    switching = false;
  });
});
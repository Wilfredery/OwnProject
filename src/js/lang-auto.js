import Swal from "sweetalert2";
import { setLang, applyTranslations } from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("lang-toggle");

  // Observador para contenido dinámico
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

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      const current = localStorage.getItem("lang") || "es";
      const newLang = current === "es" ? "en" : "es";

      setLang(newLang);

      langBtn.textContent =
        newLang === "es" ? "Español 🇪🇸" : "English 🇬🇧";

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
  }

  // Idioma inicial
  applyTranslations();
});

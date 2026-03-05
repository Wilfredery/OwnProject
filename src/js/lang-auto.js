/**
 * ============================================================
 *  LANGUAGE TOGGLE & LIVE TRANSLATION OBSERVER
 * ============================================================
 *
 * Handles:
 * - Language switching (ES / EN)
 * - Real-time translation updates
 * - DOM mutation observation for dynamic content
 * - UI synchronization
 * - Anti-spam protection
 *
 * Dependencies:
 * - i18n system (setLang, getLang, applyTranslations)
 * - SweetAlert for UX feedback
 *
 * Features:
 * - Automatically translates newly added DOM nodes
 * - Keeps toggle button synced with actual language state
 * - Prevents rapid language switching
 *
 * ============================================================
 */

import Swal from "sweetalert2";
import { setLang, getLang, applyTranslations } from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {

  const langBtn = document.getElementById("lang-toggle");
  if (!langBtn) return;

  /* ============================================================
     MUTATION OBSERVER (Selective Translation)
  ============================================================ */

  /**
   * Observes DOM changes and applies translations
   * only to relevant nodes that contain i18n attributes.
   *
   * Optimized to avoid unnecessary reprocessing.
   */
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

  /**
   * Observe entire document body for dynamically added content.
   */
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  /* ============================================================
     SYNC TOGGLE BUTTON STATE
  ============================================================ */

  /**
   * Updates button label to reflect
   * the currently active language.
   */
  function syncLangButton() {

    const lang = getLang();

    langBtn.textContent =
      lang === "es" ? "Español 🇪🇸" : "English 🇬🇧";
  }

  /* ============================================================
     INITIAL STATE
  ============================================================ */

  /**
   * Apply translations to entire page
   * and sync UI button on load.
   */
  applyTranslations();
  syncLangButton();

  /* ============================================================
     ANTI-SPAM PROTECTION
  ============================================================ */

  /**
   * Prevents rapid toggling
   * that could cause race conditions.
   */
  let switching = false;

  /* ============================================================
     LANGUAGE TOGGLE HANDLER
  ============================================================ */

  langBtn.addEventListener("click", async () => {

    if (switching) return;
    switching = true;

    /**
     * Determine current and next language
     */
    const current = getLang();
    const newLang = current === "es" ? "en" : "es";

    /**
     * Update global language state
     */
    setLang(newLang);

    /**
     * Optional integration:
     * Update guide images if function exists.
     */
    window.updateGuideImages?.();

    /**
     * Reflect updated state in UI
     */
    syncLangButton();

    /**
     * User feedback toast
     */
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
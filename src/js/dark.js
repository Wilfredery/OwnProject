/**
 * ============================================================
 *  THEME TOGGLE MODULE (LIGHT / DARK MODE)
 * ============================================================
 *
 * Handles:
 * - Theme persistence via localStorage
 * - DOM class toggling
 * - UI toggle button updates
 * - Optional user notification (SweetAlert)
 * - i18n translation support
 *
 * Behavior:
 * - Applies saved theme on page load
 * - Defaults to "light" if none is stored
 * - Allows runtime switching
 *
 * Storage Key:
 * - "theme"
 *
 * ============================================================
 */

import Swal from "sweetalert2";
import { t } from "./i18n/index.js";

(function () {

  document.addEventListener("DOMContentLoaded", () => {

    const toggleBtn = document.getElementById("theme-toggle");
    const body = document.body;

    /**
     * Applies the selected theme.
     *
     * @param {string} theme - "light" or "dark"
     * @param {boolean} notify - Whether to show success toast
     */
    function applyTheme(theme, notify = false) {

      const isDark = theme === "dark";

      /**
       * Toggle CSS class on <body>
       */
      body.classList.toggle("dark", isDark);

      /**
       * Persist theme selection
       */
      localStorage.setItem("theme", theme);

      /**
       * Update toggle button label
       */
      if (toggleBtn) {
        toggleBtn.textContent = isDark ? "Dark 🌙" : "Light 🌞";
      }

      /**
       * Optional success notification
       */
      if (notify) {
        Swal.fire({
          title: isDark
            ? t("darkmodeEnabled")
            : t("lightmodeEnabled"),
          toast: true,
          position: "top",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          customClass: { popup: "minimal-alert" }
        });
      }
    }

    /* ============================================================
       APPLY SAVED THEME ON LOAD
    ============================================================ */

    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    if (!toggleBtn) return;

    /* ============================================================
       TOGGLE HANDLER
    ============================================================ */

    toggleBtn.addEventListener("click", () => {

      const newTheme = body.classList.contains("dark")
        ? "light"
        : "dark";

      applyTheme(newTheme, true);
    });

  });

})();
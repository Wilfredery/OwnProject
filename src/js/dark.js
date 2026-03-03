// src/js/dark.js
import Swal from "sweetalert2";
import { t } from "./i18n/index.js";

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("theme-toggle");
    const body = document.body;

    function applyTheme(theme, notify = false) {
      const isDark = theme === "dark";
      body.classList.toggle("dark", isDark);
      localStorage.setItem("theme", theme);

      if (toggleBtn) {
        toggleBtn.textContent = isDark ? "Dark 🌙" : "Light 🌞";
      }

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

    // 🌗 aplicar tema guardado
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      const newTheme = body.classList.contains("dark")
        ? "light"
        : "dark";

      applyTheme(newTheme, true);
    });
  });
})();
// src/js/dark.js
import Swal from "sweetalert2";
import {t} from "./i18n/index.js";

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Aplicar el tema guardado SIEMPRE
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.toggle('dark', savedTheme === 'dark');

    if (!toggleBtn) return;

    toggleBtn.textContent = savedTheme === 'dark' ? 'Dark 🌙' : 'Light 🌞';

    toggleBtn.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark');
      const newTheme = isDark ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);

      toggleBtn.textContent = isDark ? 'Dark 🌙' : 'Light 🌞';

      Swal.fire({
        title: isDark ? t("darkmodeEnabled") : t("lightmodeEnabled"),
        toast: true,
        position: "top",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        customClass: {
          popup: "minimal-alert"
        }
      });
    });
  });
})();

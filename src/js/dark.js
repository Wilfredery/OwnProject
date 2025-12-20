// src/js/dark.js
import Swal from "sweetalert2";

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

      const currentLang = localStorage.getItem('lang') || 'es';

      const messages = {
        es: {
          dark: "Modo oscuro activado 🌙",
          light: "Modo claro activado 🌞"
        },
        en: {
          dark: "Dark mode enabled 🌙",
          light: "Light mode enabled 🌞"
        }
      };

      Swal.fire({
        title: isDark ? messages[currentLang].dark : messages[currentLang].light,
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

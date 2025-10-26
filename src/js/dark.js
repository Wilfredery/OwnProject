// dark.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Aplicar el tema guardado SIEMPRE, aunque no haya botón
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.toggle('dark', savedTheme === 'dark');

    // Si existe el botón, sincronizar su texto y agregar evento
    if (toggleBtn) {
      toggleBtn.textContent = savedTheme === 'dark' ? 'Dark 🌙' : 'Light 🌞';

      toggleBtn.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark');
        const newTheme = isDark ? 'dark' : 'light';
        toggleBtn.textContent = isDark ? 'Dark 🌙' : 'Light 🌞';
        localStorage.setItem('theme', newTheme);
      });
    }
  });
})();

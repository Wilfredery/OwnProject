// dark.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (!toggleBtn) return; // Si no hay botón, no hace nada

    // Comprobar si ya hay un tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('dark');
      toggleBtn.textContent = 'Dark 🌙';
    }

    // Evento de cambio de tema
    toggleBtn.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark');
      toggleBtn.textContent = isDark ? 'Dark 🌙' : 'Light 🌞';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  });
})();

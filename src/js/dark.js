// dark.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (!toggleBtn) return;

    // Leer y aplicar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      body.classList.add('dark');
      toggleBtn.textContent = 'Dark 🌙';
    } else {
      body.classList.remove('dark');
      toggleBtn.textContent = 'Light 🌞';
    }

    // Cambiar tema al hacer clic
    toggleBtn.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark');
      const newTheme = isDark ? 'dark' : 'light';
      toggleBtn.textContent = isDark ? 'Dark 🌙' : 'Light 🌞';
      localStorage.setItem('theme', newTheme);
    });
  });
})();

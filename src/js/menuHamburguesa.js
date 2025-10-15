(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const menuBtn = document.querySelector('.menu-btn');
        const menuContainer = document.querySelector('.menu-container');

        if (!menuBtn || !menuContainer) return; // evita errores si no existen

        // Abrir/cerrar menú al hacer click en el botón
        menuBtn.addEventListener('click', () => {
            menuContainer.classList.toggle('open');
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!menuContainer.contains(e.target) && !menuBtn.contains(e.target)) {
                menuContainer.classList.remove('open');
            }
        });
    });
})();

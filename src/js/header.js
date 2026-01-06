// src/js/header.js

// Menú hamburguesa
export function initHeaderMenu() {
    const btn = document.querySelector(".menu-btn");
    const menu = document.querySelector(".dropdown-menu");

    if (!btn || !menu) return;

    btn.addEventListener("click", () => {
        menu.classList.toggle("open");
    });

    // Cerrar si el usuario hace click afuera
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove("open");
        }
    });
}

// Inicializar todo
document.addEventListener("DOMContentLoaded", () => {
    // initTheme();
    initHeaderMenu();
});

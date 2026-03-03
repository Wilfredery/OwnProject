// src/js/header.js

export function initHeaderMenu() {
  const btn = document.querySelector(".menu-btn");
  const menu = document.querySelector(".dropdown-menu");

  if (!btn || !menu) return;

  // Toggle menú
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // 👈 clave
    menu.classList.toggle("open");
  });

  // Evitar que clicks dentro del menú lo cierren
  menu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Cerrar al hacer click fuera
  document.addEventListener("click", () => {
    menu.classList.remove("open");
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  initHeaderMenu();
});
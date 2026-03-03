const customSelects = document.querySelectorAll(".custom-select");

customSelects.forEach((customSelect) => {
  const selected = customSelect.querySelector(".selected");
  const options = customSelect.querySelectorAll(".options li");
  if (!selected || options.length === 0) return;

  // Abrir / cerrar menú al hacer click en el seleccionado
  selected.addEventListener("click", (e) => {
    e.stopPropagation(); // evita que el click se propague al documento
    customSelect.classList.toggle("open");
  });

  // Seleccionar opción
  options.forEach(option =>
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      customSelect.classList.remove("open");
    })
  );
});

// Cerrar cualquier select si se hace clic fuera
document.addEventListener("click", () => {
  customSelects.forEach(cs => cs.classList.remove("open"));
});
// Selecciona todos los select personalizados
const customSelects = document.querySelectorAll('.custom-select');

customSelects.forEach((customSelect) => {
  const selected = customSelect.querySelector('.selected');
  const options = customSelect.querySelectorAll('.options li');

  // Abre/cierra las opciones al hacer clic
  selected.addEventListener('click', () => {
    customSelect.classList.toggle('open');
  });

  // Cambia el texto seleccionado y cierra el menú
  options.forEach((option) => {
    option.addEventListener('click', () => {
      selected.textContent = option.textContent;
      customSelect.classList.remove('open');

      // Si quieres hacer algo según el valor:
      // const value = option.dataset.value;
    });
  });
});

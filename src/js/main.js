(function () {
  
  // Simula notas guardadas
  const notes = [];

  // Busca el botón
  const createBtn = document.querySelector('.create-btn');

  // Si no existe el botón, sigue ejecutando el resto del código sin errores
  if (!createBtn) {
    console.warn('⚠️ No se encontró .create-btn en esta página, continuando sin modificar el botón.');
    return; // simplemente detiene esta parte, no afecta otras funciones del archivo
  }

  // Si existe, actualiza el texto según la cantidad de notas
createBtn.innerHTML = notes.length === 0
  ? '<span class="btn-icon" >📝</span><span class="btn-text" data-i18n="create_note">¡Crea tu primera nota!</span>'
  : '<span class="btn-icon">➕</span><span class="btn-text" data-i18n="create_note">Crea una nota!</span>';


})();

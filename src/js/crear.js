(function () {
  document.addEventListener("DOMContentLoaded", () => {

    const saveBtn = document.getElementById("save-note");
    if (!saveBtn) return; // ← evita el error si el botón no está en el HTML

    saveBtn.addEventListener("click", () => {

      const title = document.getElementById("note-title").value.trim();
      const content = document.getElementById("note-content").value.trim();

      const currentLang = localStorage.getItem('lang') || 'es';

      const messages = {
        es: {
          missing: "Debes completar el título y contenido.",
          saved: "Nota guardada correctamente 📒"
        },
        en: {
          missing: "You must complete the title and content.",
          saved: "Note saved successfully 📒"
        }
      };

      if (!title || !content) {
        Swal.fire({
          title: messages[currentLang].missing,
          icon: "warning",
          position: "top",
          toast: true,
          timer: 1800,
          showConfirmButton: false
        });
        return;
      }

      Swal.fire({
        title: messages[currentLang].saved,
        icon: "success",
        position: "top",
        toast: true,
        timer: 1800,
        showConfirmButton: false
      });
    });
  });

})();
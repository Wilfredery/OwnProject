(function() {
    
    document.addEventListener("DOMContentLoaded", () => {

        const noteId = document.getElementById("note-id").value;
        const titleInput = document.getElementById("edit-title");
        const contentInput = document.getElementById("edit-content");
        const form = document.getElementById("edit-form");
        const deleteBtn = document.getElementById("delete-note");

        // TEMPORAL — Mismas notas de prueba
        const notes = [
            { id: "1", title: "Tarea de JavaScript", content: "Aprender funciones" },
            { id: "2", title: "Compras", content: "Leche, pan, huevos" },
            { id: "3", title: "Ideas de proyecto", content: "App de notas con Firebase" },
        ];

        // 1️⃣ Cargar datos actuales de la nota
        const note = notes.find(n => n.id === noteId);

        if (!note) return alert("Nota no encontrada");

        titleInput.value = note.title;
        contentInput.value = note.content;

        // 2️⃣ Guardar cambios
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            note.title = titleInput.value;
            note.content = contentInput.value;

            Swal.fire({
                icon: "success",
                title: "Nota actualizada ✔",
                timer: 1200,
                showConfirmButton: false,
                position: "top"
            });
        });

        // 3️⃣ Eliminar nota con confirmación
        deleteBtn.addEventListener("click", () => {
            Swal.fire({
                title: "¿Seguro que deseas eliminar?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                if (result.isConfirmed) {
                    // Aquí se eliminará en Firebase luego
                    Swal.fire({
                        icon: "success",
                        title: "Eliminada",
                        timer: 1500,
                        showConfirmButton: false
                    });

                    setTimeout(() => {
                        window.location.href = "/search";
                    }, 1500);
                }
            });
        });

    });

})();
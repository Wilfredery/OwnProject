import { db } from "./firebase.js";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

(function () {

  document.addEventListener("DOMContentLoaded", async () => {

    const noteIdIdentificador = document.getElementById("note-id");
        // ⛔ Si esta página NO es editar.ejs, salimos sin errores
    if (!noteIdIdentificador) return;

    // ✔ Si estamos en editar.ejs, seguimos...
    const noteId = noteIdIdentificador.value;
    
    const titleInput = document.getElementById("edit-title");
    const contentInput = document.getElementById("edit-content");
    const form = document.getElementById("edit-form");
    const deleteBtn = document.getElementById("delete-note");


    // 1️⃣ Cargar datos reales de Firestore
    async function loadNote() {
      try {
        const docRef = doc(db, "notes", noteId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          Swal.fire({
            icon: "error",
            title: "Nota no encontrada",
            timer: 1500,
            showConfirmButton: false
          });
          return null;
        }

        return { id: docSnap.id, ...docSnap.data() };
      } catch (error) {
        console.error("Error cargando nota:", error);
        return null;
      }
    }

    // 🔥 Cargar nota
    const note = await loadNote();

    if (!note) return;

    // Rellenar inputs
    titleInput.value = note.title;
    contentInput.value = note.content;

    // 2️⃣ Guardar cambios en Firestore
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        await updateDoc(doc(db, "notes", noteId), {
          title: titleInput.value,
          content: contentInput.value
        });

        Swal.fire({
          icon: "success",
          title: "Nota actualizada ✔",
          timer: 1300,
          position: "top",
          showConfirmButton: false
        });

      } catch (error) {
        console.error("Error actualizando:", error);
        Swal.fire({
          icon: "error",
          title: "Error actualizando 😞",
          timer: 1400,
          showConfirmButton: false
        });
      }
    });

    // 3️⃣ Eliminar desde Firestore
    deleteBtn.addEventListener("click", () => {

      Swal.fire({
        title: "¿Seguro que deseas eliminar?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {

        if (!result.isConfirmed) return;

        try {
          await deleteDoc(doc(db, "notes", noteId));

          Swal.fire({
            icon: "success",
            title: "Eliminada",
            timer: 1500,
            showConfirmButton: false
          });

          setTimeout(() => {
            window.location.href = "/search";
          }, 1500);

        } catch (error) {
          console.error("Error eliminando:", error);
          Swal.fire({
            icon: "error",
            title: "No se pudo eliminar",
            timer: 1500,
            showConfirmButton: false
          });
        }
      });

    });

  });

})();

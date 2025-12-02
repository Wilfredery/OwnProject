import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

(async function () {

  async function saveNoteToFirestore(title, content) {
    try {
      await addDoc(collection(db, "notes"), {
        title,
        content,
        created_at: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error al guardar la nota", error);
      return false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {

    const saveBtn = document.getElementById("save-note");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", async () => {

      const title = document.getElementById("note-title").value.trim();
      const content = document.getElementById("note-content").value.trim();

      const currentLang = localStorage.getItem('lang') || 'es';

      const messages = {
        es: {
          missing: "Debes completar el título y contenido.",
          saved: "Nota guardada correctamente 📒",
          error: "Hubo un error al guardar 😞"
        },
        en: {
          missing: "You must complete the title and content.",
          saved: "Note saved successfully 📒",
          error: "There was an error saving 😞"
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

      // 🟡 Guardar en Firestore
      const success = await saveNoteToFirestore(title, content);

      if (!success) {
        Swal.fire({
          title: messages[currentLang].error,
          icon: "error",
          position: "top",
          toast: true,
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      // 🟢 Nota guardada correctamente
      Swal.fire({
        title: messages[currentLang].saved,
        icon: "success",
        position: "top",
        toast: true,
        timer: 1800,
        showConfirmButton: false
      });

      // Opcional: limpiar inputs
      document.getElementById("note-title").value = "";
      document.getElementById("note-content").value = "";
    });

  });

})();

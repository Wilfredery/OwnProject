// src/js/crear.js
import Swal from "sweetalert2";
import { db, serverTimestamp, getCurrentUser } from "./auth.js";
import { collection, addDoc } from "firebase/firestore";

(async function () {

async function saveNoteToFirestore(title, content) {
  const user = await getCurrentUser(); // ✅ AWAIT AQUÍ
  if (!user) return false;

  try {
    await addDoc(collection(db, "notes"), {
      uid: user.uid,               // 🔐 CLAVE
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

      const currentLang = localStorage.getItem("lang") || "es";

      const messages = {
        es: {
          missing: "⚠️ Debes completar el título y el contenido.",
          saved: "📒 Nota guardada correctamente",
          error: "😞 Hubo un error al guardar.",
          askNew: "¿Qué deseas hacer ahora?",
          createAgain: "📝 Crear otra nota",
          goList: "📋 Ir a la lista"
        },
        en: {
          missing: "⚠️ You must complete the title and content.",
          saved: "📒 Note saved successfully",
          error: "😞 An error occurred while saving.",
          askNew: "What would you like to do next?",
          createAgain: "📝 Create another note",
          goList: "📋 Go to list"
        }
      };

      if (!title || !content) {
        Swal.fire({
          title: messages[currentLang].missing,
          icon: "warning",
          position: "top",
          toast: true,
          timer: 1800,
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });
        return;
      }

      const success = await saveNoteToFirestore(title, content);

      if (!success) {
        Swal.fire({
          title: messages[currentLang].error,
          icon: "error",
          position: "top",
          toast: true,
          timer: 2000,
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });
        return;
      }

      Swal.fire({
        title: messages[currentLang].saved,
        icon: "success",
        position: "top",
        toast: true,
        timer: 1600,
        customClass: { popup: "minimal-alert" },
        showConfirmButton: false
      }).then(() => {

        Swal.fire({
          title: messages[currentLang].askNew,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: messages[currentLang].createAgain,
          cancelButtonText: messages[currentLang].goList,
          reverseButtons: true,
          customClass: { popup: "minimal-alert" },
          allowOutsideClick: false
        }).then(choice => {
          if (choice.isConfirmed) {
            document.getElementById("note-title").value = "";
            document.getElementById("note-content").value = "";
          } else {
            window.location.href = "/search";
          }
        });

      });
    });
  });

})();

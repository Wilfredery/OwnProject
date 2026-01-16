// src/js/crear.js
import Swal from "sweetalert2";
import { db, serverTimestamp, getCurrentUser } from "./auth.js";
import { collection, addDoc } from "firebase/firestore";
import {t} from "./i18n/index.js";

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

      if (!title || !content) {
        Swal.fire({
          title: t("completeFields"),
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
          title: t("errorSave"),
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
        title: t("savedNote"),
        icon: "success",
        position: "top",
        toast: true,
        timer: 1600,
        customClass: { popup: "minimal-alert" },
        showConfirmButton: false
      }).then(() => {

        Swal.fire({
          title: t("ask"),
          icon: "question",
          showCancelButton: true,
          confirmButtonText: t("createAgain"),
          cancelButtonText: t("goList"),
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

// src/js/editar.js
import Swal from "sweetalert2";
import { db, onAuthReady } from "./auth.js";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { t } from "./i18n/index.js";

(function () {

  document.addEventListener("DOMContentLoaded", async () => {

    const noteIdIdentificador = document.getElementById("note-id");
    if (!noteIdIdentificador) return;

    const noteId = noteIdIdentificador.value;

    const titleInput = document.getElementById("edit-title");
    const contentInput = document.getElementById("edit-content");
    const form = document.getElementById("edit-form");
    const deleteBtn = document.getElementById("delete-note");

    /* ==========================================================
       🔐 AUTH (3 ESTADOS)
    ========================================================== */
    const authState = await onAuthReady();

    // 👤 GUEST → fuera
    if (authState.role === "guest") {
      await Swal.fire({
        icon: "warning",
        title: t("mustLogin"),
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "minimal-alert" }
      });

      window.location.href = "/";
      return;
    }

    // 🟡 NO VERIFICADO → aviso + fuera
    if (authState.role === "unverified") {
      await Swal.fire({
        icon: "info",
        title: t("titleplsverifyemail"),
        text: t("plsverifyemail"),
        confirmButtonText: t("confirmplsverifyemail"),
        customClass: { popup: "minimal-alert" }
      });

      window.location.href = "/search";
      return;
    }

    // 🟢 VERIFICADO
    const user = authState.user;

    /* ==========================================================
       🔥 CARGAR NOTA + VALIDAR PROPIETARIO
    ========================================================== */
    async function loadNote() {
      try {
        const docRef = doc(db, "notes", noteId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          Swal.fire({
            icon: "error",
            title: t("notewasntFound"),
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: "minimal-alert" }
          });
          return null;
        }

        const data = docSnap.data();

        // 🔒 VALIDACIÓN CRÍTICA DE PROPIETARIO
        if (data.uid !== user.uid) {
          Swal.fire({
            icon: "error",
            title: t("denied"),
            text: t("noteNotNote"),
            timer: 1800,
            showConfirmButton: false,
            customClass: { popup: "minimal-alert" }
          });

          setTimeout(() => {
            window.location.href = "/search";
          }, 1800);

          return null;
        }

        return { id: docSnap.id, ...data };

      } catch (error) {
        console.error("Error cargando nota:", error);
        return null;
      }
    }

    const note = await loadNote();
    if (!note) return;

    titleInput.value = note.title;
    contentInput.value = note.content;

    /* ==========================================================
       ✏️ ACTUALIZAR NOTA
    ========================================================== */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        await updateDoc(doc(db, "notes", noteId), {
          title: titleInput.value.trim(),
          content: contentInput.value.trim()
        });

        Swal.fire({
          icon: "success",
          title: t("updatedNote"),
          timer: 1300,
          position: "top",
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });

      } catch (error) {
        console.error("Error actualizando:", error);
        Swal.fire({
          icon: "error",
          title: t("updatedError"),
          timer: 1400,
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });
      }
    });

    /* ==========================================================
       🗑️ ELIMINAR NOTA
    ========================================================== */
    deleteBtn.addEventListener("click", async () => {

      const result = await Swal.fire({
        title: t("askDelete"),
        text: t("textAskDelete"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("confirmDelete"),
        cancelButtonText: t("cancelDelete"),
        customClass: { popup: "minimal-alert" }
      });

      if (!result.isConfirmed) return;

      try {
        await deleteDoc(doc(db, "notes", noteId));

        Swal.fire({
          icon: "success",
          title: t("alreadyDeleted"),
          timer: 1500,
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });

        setTimeout(() => {
          window.location.href = "/search";
        }, 1500);

      } catch (error) {
        console.error("Error eliminando:", error);
        Swal.fire({
          icon: "error",
          title: t("errorDelete"),
          timer: 1500,
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });
      }
    });

  });

})();

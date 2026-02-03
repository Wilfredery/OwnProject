// src/js/editar.js
import Swal from "sweetalert2";
import { db, onAuthReady } from "./auth.js";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { t } from "./i18n/index.js";

(function () {
  document.addEventListener("DOMContentLoaded", async () => {

    const noteIdEl = document.getElementById("note-id");
    if (!noteIdEl) return;

    const noteId = noteIdEl.value;

    const titleInput = document.getElementById("edit-title");
    const contentInput = document.getElementById("edit-content");
    const form = document.getElementById("edit-form");
    const deleteBtn = document.getElementById("delete-note");
    const saveBtn = form.querySelector("button[type='submit']");

    /* ==========================================================
       ⏳ ESTADO INICIAL: CARGANDO
    ========================================================== */
    titleInput.placeholder = t("loadingTitle");
    contentInput.placeholder = t("loadingText");

    titleInput.disabled = true;
    contentInput.disabled = true;
    saveBtn.disabled = true;
    deleteBtn.disabled = true;

    /* ==========================================================
       🔐 AUTH
    ========================================================== */
    const authState = await onAuthReady();
    if (!authState) return;

    const isGuest = authState.role === "guest";
    const isUnverified = authState.role === "unverified";
    const user = authState.user;

    if (isUnverified) {
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

    /* ==========================================================
       🔥 LOAD NOTE
    ========================================================== */
    async function loadNote() {
      if (isGuest) {
        const notes = JSON.parse(localStorage.getItem("guestNotes")) || [];
        return notes.find(n => n.id === noteId) || null;
      }

      const snap = await getDoc(doc(db, "notes", noteId));
      if (!snap.exists()) return null;

      const data = snap.data();

      if (data.uid !== user.uid) {
        await Swal.fire({
          icon: "error",
          title: t("denied"),
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" }
        });
        return null;
      }

      return { id: snap.id, ...data };
    }

    const note = await loadNote();
    if (!note) {
      await Swal.fire({
        icon: "error",
        title: t("notewasntFound"),
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "minimal-alert" }
      });
      window.location.href = "/search";
      return;
    }

    /* ==========================================================
       ✅ NOTA CARGADA → HABILITAR FORM
    ========================================================== */
    titleInput.value = note.title;
    contentInput.value = note.content;

    titleInput.placeholder = "";
    contentInput.placeholder = "";

    titleInput.disabled = false;
    contentInput.disabled = false;
    saveBtn.disabled = false;
    deleteBtn.disabled = false;

    /* ==========================================================
       ✏️ UPDATE
    ========================================================== */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const content = contentInput.value.trim();

      try {
        if (isGuest) {
          let notes = JSON.parse(localStorage.getItem("guestNotes")) || [];
          notes = notes.map(n =>
            n.id === noteId ? { ...n, title, content } : n
          );
          localStorage.setItem("guestNotes", JSON.stringify(notes));
        } else {
          await updateDoc(doc(db, "notes", noteId), { title, content });
        }

        const result = await Swal.fire({
          icon: "success",
          title: t("updatedNote"),
          text: t("ask"),
          showCancelButton: true,
          confirmButtonText: t("goList"),
          cancelButtonText: t("stayHere"),
          customClass: { popup: "minimal-alert" }
        });

        if (result.isConfirmed) {
          window.location.href = "/search";
        }

      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: t("updatedError"),
          timer: 1400,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" }
        });
      }
    });

    /* ==========================================================
       🗑️ DELETE
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
        if (isGuest) {
          let notes = JSON.parse(localStorage.getItem("guestNotes")) || [];
          notes = notes.filter(n => n.id !== noteId);
          localStorage.setItem("guestNotes", JSON.stringify(notes));
        } else {
          await deleteDoc(doc(db, "notes", noteId));
        }

        Swal.fire({
          icon: "success",
          title: t("alreadyDeleted"),
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" }
        });

        setTimeout(() => {
          window.location.href = "/search";
        }, 1500);

      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: t("errorDelete"),
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" }
        });
      }
    });

  });
})();

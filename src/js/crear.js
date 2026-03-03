// src/js/crear.js
import Swal from "sweetalert2";
import { db, serverTimestamp, onAuthReady } from "./auth.js";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { t } from "./i18n/index.js";

(function () {

  document.addEventListener("DOMContentLoaded", async () => {

    const saveBtn = document.getElementById("save-note");
    if (!saveBtn) return;

    let isSaving = false;

    const authState = await onAuthReady();

    /* ==========================================================
       👤 GUEST
    ========================================================== */
    if (!authState || authState.role === "guest") {

      saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (isSaving) return;
        isSaving = true;

        const titleInput = document.getElementById("note-title");
        const contentInput = document.getElementById("note-content");

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
          isSaving = false;
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

        try {
          const notes = JSON.parse(localStorage.getItem("guestNotes")) || [];

          // 🔎 Buscar duplicado (case-insensitive)
          const duplicatedNote = notes.find(
            n => n.title.toLowerCase() === title.toLowerCase()
          );

          if (duplicatedNote) {
            const confirmDuplicate = await Swal.fire({
              title: t("titleNoteDuplicate"), 
              html: `
                <a href="/editar/${duplicatedNote.id}" 
                   style="color:#3085d6;text-decoration:underline;">
                    ${t("checkDuplicate")}
                </a> <p>${t("textNoteDuplicate")}</p>
              `,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: t("duplicateConfirm"),
              cancelButtonText: t("duplicateCancel"),
              reverseButtons: true,
              allowOutsideClick: false,
              customClass: { popup: "minimal-alert" }
            });

            if (!confirmDuplicate.isConfirmed) {
              isSaving = false;
              return;
            }
          }

          notes.push({
            id: crypto.randomUUID(),
            title,
            content,
            created_at: Date.now()
          });

          localStorage.setItem("guestNotes", JSON.stringify(notes));

          await Swal.fire({
            title: t("savedNote"),
            icon: "success",
            position: "top",
            toast: true,
            timer: 1600,
            customClass: { popup: "minimal-alert" },
            showConfirmButton: false
          });

          const choice = await Swal.fire({
            title: t("ask"),
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t("createAgain"),
            cancelButtonText: t("goList"),
            reverseButtons: true,
            customClass: { popup: "minimal-alert" },
            allowOutsideClick: false
          });

          if (choice.isConfirmed) {
            titleInput.value = "";
            contentInput.value = "";
            isSaving = false;
          } else {
            window.location.href = "/search";
          }

        } catch (err) {
          console.error(err);
          isSaving = false;
        }
      });

      return;
    }

    /* ==========================================================
       🟡 AUTH NO VERIFICADO
    ========================================================== */
    if (authState.role === "unverified") {
      await Swal.fire({
        icon: "info",
        title: t("titleplsverifyemail"),
        text: t("plsverifyemail"),
        confirmButtonText: t("confirmplsverifyemail"),
        customClass: { popup: "minimal-alert" }
      });

      window.location.href = "/";
      return;
    }

    /* ==========================================================
       🟢 AUTH VERIFICADO
    ========================================================== */
    const user = authState.user;

    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (isSaving) return;
      isSaving = true;

      const titleInput = document.getElementById("note-title");
      const contentInput = document.getElementById("note-content");

      const title = titleInput.value.trim();
      const content = contentInput.value.trim();

      if (!title || !content) {
        isSaving = false;
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

      try {

        // 🔎 Buscar duplicado en Firestore (case-insensitive)
        const q = query(
          collection(db, "notes"),
          where("uid", "==", user.uid),
          where("title_lower", "==", title.toLowerCase())
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const duplicatedDoc = snapshot.docs[0];

          const confirmDuplicate = await Swal.fire({
            title: t("titleNoteDuplicate"),
            html: `
              <a href="/editar/${duplicatedDoc.id}" 
                 style="color:#3085d6;text-decoration:underline;">
                  ${t("checkDuplicate")}
              </a><br><br>
              <p>${t("textNoteDuplicate")}</p>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: t("duplicateConfirm"),
            cancelButtonText: t("duplicateCancel"),
            reverseButtons: true,
            allowOutsideClick: false,
            customClass: { popup: "minimal-alert" }
          });

          if (!confirmDuplicate.isConfirmed) {
            isSaving = false;
            return;
          }
        }

        // 💾 Guardar nota con campo normalizado
        await addDoc(collection(db, "notes"), {
          uid: user.uid,
          title,
          title_lower: title.toLowerCase(),
          content,
          created_at: serverTimestamp()
        });

        await Swal.fire({
          title: t("savedNote"),
          icon: "success",
          position: "top",
          toast: true,
          timer: 1600,
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });

        const choice = await Swal.fire({
          title: t("ask"),
          icon: "question",
          showCancelButton: true,
          confirmButtonText: t("createAgain"),
          cancelButtonText: t("goList"),
          reverseButtons: true,
          customClass: { popup: "minimal-alert" },
          allowOutsideClick: false
        });

        if (choice.isConfirmed) {
          titleInput.value = "";
          contentInput.value = "";
          isSaving = false;
        } else {
          window.location.href = "/search";
        }

      } catch (err) {
        console.error("Error guardando nota:", err);
        isSaving = false;
      }
    });

  });

})();
// src/js/crear.js
import Swal from "sweetalert2";
import { db, serverTimestamp, onAuthReady } from "./auth.js";
import { collection, addDoc } from "firebase/firestore";
import { t } from "./i18n/index.js";

(function () {

  document.addEventListener("DOMContentLoaded", async () => {

    const saveBtn = document.getElementById("save-note");
    if (!saveBtn) return;

    /* ==========================================================
       🔐 AUTH (3 ESTADOS)
    ========================================================== */
    const authState = await onAuthReady();
    if (!authState) return;

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

      window.location.href = "/main";
      return;
    }

    // 🟢 VERIFICADO
    const user = authState.user;

    /* ==========================================================
       💾 GUARDAR NOTA
    ========================================================== */
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

      try {
        await addDoc(collection(db, "notes"), {
          uid: user.uid,          // 🔒 owner real
          title,
          content,
          created_at: serverTimestamp()
        });

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

      } catch (error) {
        console.error("Error al guardar nota:", error);

        Swal.fire({
          title: t("errorSave"),
          icon: "error",
          position: "top",
          toast: true,
          timer: 2000,
          customClass: { popup: "minimal-alert" },
          showConfirmButton: false
        });
      }
    });

  });

})();

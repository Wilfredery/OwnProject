// src/js/linkconfirm.js
import Swal from "sweetalert2";
import { confirmEmailWithCode } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {

  const confirmTitle = document.querySelector(".confirm__title");
  let alreadyHandled = false;

  // ⛔ No estamos en confirm.ejs
  if (!confirmTitle) return;

  const oobCode = window.__OOB_CODE__;

  /* ==========================================================
     ❌ LINK INVÁLIDO
  ========================================================== */
  if (!oobCode) {
    Swal.fire({
      icon: "error",
      title: t("linkUnvalid"),
      text: t("textlinkUnvalid"),
      customClass: { popup: "minimal-alert" }
    });
    return;
  }

  /* ==========================================================
     🔐 CONFIRMACIÓN ÚNICA (ANTI DOBLE EJECUCIÓN)
  ========================================================== */
  (async () => {
    if (alreadyHandled) return;
    alreadyHandled = true;

    try {
      await confirmEmailWithCode(oobCode);

      await Swal.fire({
        icon: "success",
        title: t("emailVerified"),
        text: t("textEmailVerified"),
        timer: 3500,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: { popup: "minimal-alert" }
      });

      window.location.replace("/login"); // 🔥 evita volver con "atrás"

    } catch (error) {
      console.error("Confirm email error:", error);

      let message = t("errorlink");

      if (error?.code === "auth/invalid-action-code") {
        message = t("invalidLink");
      } else if (error?.code === "auth/expired-action-code") {
        message = t("expiredLink");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        customClass: { popup: "minimal-alert" }
      });
    }
  })();

})();
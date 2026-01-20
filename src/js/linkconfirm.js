// src/js/linkconfirm.js
import Swal from "sweetalert2";
import { confirmEmailWithCode } from "./auth.js";
import { t } from "./i18n/index.js";

const confirmTitle = document.querySelector(".confirm__title");
let alreadyHandled = false;

if (confirmTitle) {
  const oobCode = window.__OOB_CODE__;

  if (!oobCode) {
    Swal.fire({
      icon: "error",
      title: t("linkUnvalid"),
      text: t("textlinkUnvalid"),
      customClass: { popup: "minimal-alert" }
    });
  } else {
    (async () => {
      if (alreadyHandled) return;
      alreadyHandled = true;

      try {
        await confirmEmailWithCode(oobCode);

        Swal.fire({
          icon: "success",
          title: t("emailVerified"),
          text: t("textEmailVerified"),
          timer: 4000,
          showConfirmButton: false,
          allowOutsideClick: false,
          customClass: { popup: "minimal-alert" }
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 4000);

      } catch (error) {
        let message = t("errorlink");

        if (error.code === "auth/invalid-action-code") {
          message = t("invalidLink");
        } else if (error.code === "auth/expired-action-code") {
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
  }
}

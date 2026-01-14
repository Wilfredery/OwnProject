// src/js/linkconfirm.js
import Swal from "sweetalert2";
import { auth } from "./firebase.js";
import { applyActionCode } from "firebase/auth";
import {t} from "./i18n/i18n.js";

const confirmTitle = document.querySelector(".confirm__title");

if (confirmTitle) {
  const oobCode = window.__OOB_CODE__;

  if (!oobCode) {
    Swal.fire({
      icon: "error",
      title: t("linkUnvalid"),
      text: t("textlinkUnvalid"),
      customClass: { popup: "minimal-alert" },
    });
  } else {
    (async () => {
      try {
        await applyActionCode(auth, oobCode);

        Swal.fire({
          icon: "success",
          title: t("emailVerified"),
          text: t("textEmailVerified"),
          timer: 4000,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" },
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 4000);
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: t("errorlink"),
          customClass: { popup: "minimal-alert" },
        });
      }
    })();
  }
}

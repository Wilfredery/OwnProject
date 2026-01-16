// src/js/password.js
import Swal from "sweetalert2";
import { auth } from "./firebase.js";
import { confirmPasswordReset } from "firebase/auth";
import { t } from "./i18n/index.js";

const form = document.getElementById("reset-form");

if (form) {
  const passInput = document.getElementById("reset-password");
  const confirmInput = document.getElementById("reset-password-confirm");
  const oobCode = window.__OOB_CODE__;

  if (!oobCode) {
    Swal.fire({
      icon: "error",
      title: "Enlace inválido",
      text: "El enlace para cambiar la contraseña no es válido o expiró.",
      customClass: { popup: "minimal-alert" },
    });
  } else {
    // 👇 TODO lo demás SOLO corre si hay oobCode

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const password = passInput.value;
      const confirmPassword = confirmInput.value;

      if (!password || !confirmPassword) {
        return Swal.fire({
          icon: "warning",
          title: t("requireFilds"),
          text: t("fillboth"),
          customClass: { popup: "minimal-alert" },
        });
      }

      if (password.length < 6) {
        return Swal.fire({
          icon: "error",
          title: t("shortPassW"),
          text: t("amountPassW"),
          customClass: { popup: "minimal-alert" },
        });
      }

      if (password !== confirmPassword) {
        return Swal.fire({
          icon: "error",
          title: t("notMatch"),
          text: t("notMatchPassW"),
          customClass: { popup: "minimal-alert" },
        });
      }

      try {
        await confirmPasswordReset(auth, oobCode, password);

        Swal.fire({
          icon: "success",
          title: t("passUpdated"),
          text: t("passProcessed"),
          timer: 4000,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" },
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 4000);

        form.reset();
      } catch (error) {
        console.error(error);

        let message = t("passWCantBeChanged");

        if (error.code === "auth/expired-action-code") {
          message = t("linkExpired");
        }

        if (error.code === "auth/invalid-action-code") {
          message = t("linkUnvalid");
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          customClass: { popup: "minimal-alert" },
        });
      }
    });
  }
}

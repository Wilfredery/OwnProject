// src/js/password.js
import Swal from "sweetalert2";
import { resetPassword } from "./auth.js";
import { t } from "./i18n/index.js";

const form = document.getElementById("reset-form");

if (form) {
  const passInput = document.getElementById("reset-password");
  const confirmInput = document.getElementById("reset-password-confirm");
  const oobCode = window.__OOB_CODE__;

  if (!oobCode) {
    Swal.fire({
      icon: "error",
      title: t("linkUnvalid"),
      text: t("linkExpired"),
      customClass: { popup: "minimal-alert" },
    });
  } else {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const password = passInput.value.trim();
      const confirmPassword = confirmInput.value.trim();

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
        await resetPassword(oobCode, password);

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

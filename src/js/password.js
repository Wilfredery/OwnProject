// src/js/password.js
import Swal from "sweetalert2";
import { resetPassword } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reset-form");
    if (!form) return;

    const passInput = document.getElementById("reset-password");
    const confirmInput = document.getElementById("reset-password-confirm");
    const submitBtn = form.querySelector("button[type='submit']");
    const oobCode = window.__OOB_CODE__;
    let isSubmitting = false;

    // ❌ Link inválido o expirado
    if (!oobCode) {
      Swal.fire({
        icon: "error",
        title: t("linkUnvalid"),
        text: t("linkExpired"),
        customClass: { popup: "minimal-alert" }
      });
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const password = passInput.value.trim();
      const confirmPassword = confirmInput.value.trim();

      // 🔎 Validaciones ANTES de bloquear submit
      if (!password || !confirmPassword) {
        Swal.fire({
          icon: "warning",
          title: t("requireFilds"),
          text: t("fillboth"),
          customClass: { popup: "minimal-alert" }
        });
        passInput.focus();
        return;
      }

      if (password.length < 6) {
        Swal.fire({
          icon: "error",
          title: t("shortPassW"),
          text: t("amountPassW"),
          customClass: { popup: "minimal-alert" }
        });
        passInput.focus();
        return;
      }

      if (password !== confirmPassword) {
        Swal.fire({
          icon: "error",
          title: t("notMatch"),
          text: t("notMatchPassW"),
          customClass: { popup: "minimal-alert" }
        });
        confirmInput.focus();
        return;
      }

      try {
        isSubmitting = true;
        if (submitBtn) submitBtn.disabled = true;

        // 🔐 Reset password
        await resetPassword(oobCode, password);

        Swal.fire({
          icon: "success",
          title: t("passUpdated"),
          text: t("passProcessed"),
          timer: 4000,
          showConfirmButton: false,
          allowOutsideClick: false,
          customClass: { popup: "minimal-alert" }
        });

        form.reset();
        window.location.href = "/login";

      } catch (error) {
        console.error("Reset password error:", error);

        let message = t("passWCantBeChanged");

        if (error.code === "auth/expired-action-code") {
          message = t("linkExpired");
        } else if (error.code === "auth/invalid-action-code") {
          message = t("linkUnvalid");
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          customClass: { popup: "minimal-alert" }
        });

      } finally {
        isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();
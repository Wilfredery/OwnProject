// src/js/olvidar.js
import Swal from "sweetalert2";
import { sendPasswordReset } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgot-form");
    if (!form) return;

    const emailInput = document.getElementById("forgot-email");
    let isSubmitting = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (isSubmitting) return;
      isSubmitting = true;

      const email = emailInput.value.trim();

      if (!email) {
        isSubmitting = false;
        return Swal.fire({
          icon: "warning",
          title: t("requiredEmail"),
          text: t("writeEmail"),
          customClass: { popup: "minimal-alert" }
        });
      }

      try {
        await sendPasswordReset(email);

        await Swal.fire({
          icon: "success",
          title: t("emailSent"),
          text: t("checkSpam"),
          allowOutsideClick: false,
          customClass: { popup: "minimal-alert" }
        });

        form.reset();

      } catch (error) {
        console.error("Reset password error:", error);

        // 🔐 Mensaje genérico por seguridad
        Swal.fire({
          icon: "error",
          title: "Error",
          text: t("errorForgot"),
          customClass: { popup: "minimal-alert" }
        });

      } finally {
        isSubmitting = false;
      }
    });
  });
})();

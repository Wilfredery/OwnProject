// src/js/olvidar.js
import Swal from "sweetalert2";
import { sendResetPassword } from "./auth.js";
import { t } from "./i18n/index.js";

const form = document.getElementById("forgot-form");

if (form) {
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
        customClass: { popup: "minimal-alert" },
      });
    }

    try {
      await sendResetPassword(email);

      Swal.fire({
        icon: "success",
        title: t("emailSent"),
        text: t("checkSpam"),
        customClass: { popup: "minimal-alert" },
      });

      form.reset();

    } catch (error) {
      let msg = t("errorForgot");

      if (error.code === "auth/user-not-found") {
        msg = t("noAccount");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        customClass: { popup: "minimal-alert" },
      });

    } finally {
      isSubmitting = false;
    }
  });
}

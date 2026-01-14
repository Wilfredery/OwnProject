// src/js/olvidar.js
import Swal from "sweetalert2";
import { auth, sendPasswordResetEmail } from "./firebase.js";
import { t } from "./i18n/i18n.js";

const form = document.getElementById("forgot-form");

if (form) {
  const emailInput = document.getElementById("forgot-email");
  let isSubmitting = false; // 🔒 evita doble envío

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // 🛑 bloqueo real
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
      const actionCodeSettings = {
        url: `${window.location.origin}/password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

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
      isSubmitting = false; // 🔓 libera el bloqueo
    }
  });
}

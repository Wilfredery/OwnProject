// src/js/login.js
import Swal from "sweetalert2";
import { signInWithEmail } from "./auth.js";
import { t } from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  let isSubmitting = false; // 🔐 Anti doble submit

  /* ==========================
     LOGIN EMAIL / PASSWORD
  ========================== */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const email = document
        .getElementById("login-email")
        .value.trim();

      const pass = document
        .getElementById("login-pass")
        .value; // ❌ NO TRIM

      if (!email || !pass) {
        return Swal.fire({
          title: "Error",
          text: t("errorCamposEmpty"),
          icon: "warning",
          customClass: { popup: "minimal-alert" }
        });
      }

      try {
        isSubmitting = true;

        await signInWithEmail(email, pass);

        // ✅ Login exitoso
        window.location.href = "/main";

      } catch (err) {
        console.error(err);

        let message = t("errorLoginExist");

        switch (err.code) {
          case "auth/user-not-found":
            message = t("errorUserNotFound");
            break;

          case "auth/wrong-password":
            message = t("errorLoginPassW");
            break;

          case "auth/too-many-requests":
            message = t("tooManyAttempts");
            break;
        }

        Swal.fire({
          title: "Error",
          text: message,
          icon: "error",
          customClass: { popup: "minimal-alert" }
        });
      } finally {
        isSubmitting = false;
      }
    });
  }
});

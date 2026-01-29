// src/js/login.js
import Swal from "sweetalert2";
import { signInWithEmail } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    let isSubmitting = false;

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const email = document.getElementById("login-email")?.value.trim();
      const pass = document.getElementById("login-pass")?.value;

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

        // 🔐 Login (auth real)
        const result = await signInWithEmail(email, pass);

        // 🟡 AVISO informativo (NO lógica de permisos)
        if (!result.isVerified) {
          await Swal.fire({
            icon: "info",
            title: t("tituloEmailNotVerified"),
            text: t("textEmailNotVerified"),
            confirmButtonText: t("confirmEmailNotVerified"),
            customClass: { popup: "minimal-alert" }
          });
        }

        // ✅ Redirección única
        // Los permisos reales se evaluarán en /main con onAuthReady
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
  });
})();

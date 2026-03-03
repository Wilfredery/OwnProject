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

      const emailEl = document.getElementById("login-email");
      const passEl = document.getElementById("login-pass");

      const email = emailEl?.value.trim();
      const pass = passEl?.value;

      /* ==========================================================
         ❌ VALIDACIÓN BÁSICA
      ========================================================== */
      if (!email || !pass) {
        return Swal.fire({
          icon: "warning",
          title: t("error"),
          text: t("errorCamposEmpty"),
          customClass: { popup: "minimal-alert" }
        });
      }

      try {
        isSubmitting = true;

        /* ==========================================================
           🔐 LOGIN REAL
        ========================================================== */
        const result = await signInWithEmail(email, pass);

        /* ==========================================================
           🟡 EMAIL NO VERIFICADO (SOLO UX)
        ========================================================== */
        if (!result.isVerified) {
          await Swal.fire({
            icon: "info",
            title: t("tituloEmailNotVerified"),
            text: t("textEmailNotVerified"),
            confirmButtonText: t("confirmEmailNotVerified"),
            customClass: { popup: "minimal-alert" }
          });
        }

        /* ==========================================================
           ✅ REDIRECCIÓN ÚNICA
           (los permisos reales se validan en /main)
        ========================================================== */
        window.location.replace("/");

      } catch (err) {
        console.error("Login error:", err);

        let message = t("errorLoginExist");

        switch (err?.code) {
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
          icon: "error",
          title: t("error"),
          text: message,
          customClass: { popup: "minimal-alert" }
        });

      } finally {
        isSubmitting = false;
      }
    });
  });
})();
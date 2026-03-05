/**
 * ============================================================
 *  LOGIN MODULE
 * ============================================================
 *
 * Handles user authentication via email & password.
 *
 * Responsibilities:
 * - Basic client-side validation
 * - Prevent double form submission
 * - Handle Firebase authentication
 * - Provide user feedback via SweetAlert
 * - Redirect securely after login
 *
 * Important:
 * - Role/permission validation happens server-side (/main).
 * - Email verification notice is UX-only (does not block login).
 *
 * ============================================================
 */

import Swal from "sweetalert2";
import { signInWithEmail } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {

  document.addEventListener("DOMContentLoaded", () => {

    /**
     * Ensure script runs only if login form exists.
     */
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    /**
     * Prevents duplicate submissions.
     */
    let isSubmitting = false;

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (isSubmitting) return;

      /**
       * Retrieve input values
       */
      const emailEl = document.getElementById("login-email");
      const passEl = document.getElementById("login-pass");

      const email = emailEl?.value.trim();
      const pass = passEl?.value;

      /* ==========================================================
         ❌ BASIC VALIDATION
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
           🔐 AUTHENTICATION
        ========================================================== */

        const result = await signInWithEmail(email, pass);

        /* ==========================================================
           🟡 EMAIL NOT VERIFIED (UX NOTICE)
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
           ✅ SECURE REDIRECTION
        ==========================================================
           - Always redirect to root
           - Permissions validated server-side
           - Uses replace() to prevent back navigation
        ========================================================== */

        window.location.replace("/");

      } catch (err) {

        // console.error("Login error:", err);

        /**
         * Default fallback message
         */
        let message = t("errorLoginExist");

        /**
         * Handle specific Firebase error codes
         */
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

        /**
         * Reset submission lock
         */
        isSubmitting = false;
      }

    });

  });

})();
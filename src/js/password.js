/**
 * ==========================================================
 *  FORGOT PW MODULE
 * ==========================================================
 *
 * Description:
 * Handles the password reset workflow on the client side.
 * This module validates the reset link, performs form validation,
 * executes the password reset through the authentication layer,
 * and provides user feedback using SweetAlert2.
 *
 * Responsibilities:
 * - Validate presence of the password reset action code (oobCode)
 * - Prevent duplicate form submissions
 * - Validate password fields before sending to backend
 * - Execute secure password reset via resetPassword()
 * - Display localized UI feedback messages
 * - Redirect user to login after successful reset
 *
 * Dependencies:
 * - sweetalert2 → UI alerts and notifications
 * - resetPassword() from auth.js → Executes actual password update
 * - t() from i18n → Provides localized strings
 *
 * Security Considerations:
 * - Prevents multiple submissions using isSubmitting flag
 * - Disables submit button while processing
 * - Validates password length and confirmation match
 * - Handles expired or invalid reset tokens
 *
 * Flow Overview:
 * 1. Wait for DOMContentLoaded
 * 2. Ensure reset form exists
 * 3. Validate reset link (oobCode)
 * 4. Perform client-side validation
 * 5. Execute password reset
 * 6. Provide success/error feedback
 * 7. Redirect to login page
 * ==========================================================
 */

import Swal from "sweetalert2";
import { resetPassword } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    /**
     * Main reset form element.
     * If not present, script safely exits.
     */
    const form = document.getElementById("reset-form");
    if (!form) return;

    /**
     * Password input fields.
     */
    const passInput = document.getElementById("reset-password");
    const confirmInput = document.getElementById("reset-password-confirm");

    /**
     * Submit button reference (used to disable during processing).
     */
    const submitBtn = form.querySelector("button[type='submit']");

    /**
     * Out-of-band code provided by backend template.
     * Required to validate password reset request.
     */
    const oobCode = window.__OOB_CODE__;

    /**
     * Flag to prevent multiple submissions.
     */
    let isSubmitting = false;

    /**
     * If reset link is invalid or expired, show error and stop execution.
     */
    if (!oobCode) {
      Swal.fire({
        icon: "error",
        title: t("linkUnvalid"),
        text: t("linkExpired"),
        customClass: { popup: "minimal-alert" }
      });
      return;
    }

    /**
     * Form submission handler.
     */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const password = passInput.value.trim();
      const confirmPassword = confirmInput.value.trim();

      /**
       * Client-side validation before calling authentication service.
       */

      // Required fields validation
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

      // Minimum password length validation
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

      // Password confirmation validation
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
        /**
         * Lock submission state.
         */
        isSubmitting = true;
        if (submitBtn) submitBtn.disabled = true;

        /**
         * Execute secure password reset.
         */
        await resetPassword(oobCode, password);

        /**
         * Success feedback.
         */
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

        /**
         * Redirect to login page after successful reset.
         */
        window.location.href = "/login";

      } catch (error) {
        // console.error("Reset password error:", error);

        /**
         * Default fallback message.
         */
        let message = t("passWCantBeChanged");

        /**
         * Specific Firebase error handling.
         */
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
        /**
         * Restore submission state.
         */
        isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();
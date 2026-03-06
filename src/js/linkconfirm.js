/**
 * ============================================================
 *  EMAIL VERIFICATION CONFIRMATION MODULE
 * ============================================================
 *
 * Handles verification links sent by Firebase.
 *
 * Responsibilities:
 * - Validate presence of action code (oobCode)
 * - Execute email confirmation
 * - Prevent double execution
 * - Handle Firebase error codes gracefully
 * - Redirect safely after success
 *
 * Runs only on confirm page (confirm.ejs).
 *
 * Security:
 * - Uses window.location.replace to prevent
 *   returning to confirmation page via back button.
 *
 * ============================================================
 */

import Swal from "sweetalert2";
import { confirmEmailWithCode } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {

  /**
   * Ensure script runs only on confirmation page.
   */
  const confirmTitle = document.querySelector(".confirm__title");
  let alreadyHandled = false;

  // ⛔ Exit if not on confirmation page
  if (!confirmTitle) return;

  /**
   * Action code injected from backend/template.
   * Required for Firebase email verification.
   */
  const oobCode = window.__OOB_CODE__;

  /* ==========================================================
     ❌ INVALID OR MISSING LINK
  ========================================================== */

  if (!oobCode) {
    Swal.fire({
      icon: "error",
      title: t("errorlink"),
      customClass: { popup: "minimal-alert" }
    });
    return;
  }

  /* ==========================================================
     🔐 SINGLE EXECUTION PROTECTION
  ========================================================== */

  /**
   * Immediately invoked async function
   * to handle confirmation once.
   */
  (async () => {

    if (alreadyHandled) return;
    alreadyHandled = true;

    try {

      /**
       * Confirm email using Firebase action code
       */
      await confirmEmailWithCode(oobCode);

      /**
       * Success feedback
       */
      await Swal.fire({
        icon: "success",
        title: t("emailVerified"),
        text: t("textEmailVerified"),
        timer: 3500,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: { popup: "minimal-alert" }
      });

      /**
       * Redirect securely to login page
       * (prevents navigating back to confirmation page)
       */
      window.location.replace("/login");

    } catch (error) {

      // console.error("Confirm email error:", error);

      /**
       * Default error message
       */
      let message = t("errorlink");

      /**
       * Handle specific Firebase error codes
       */
      if (error?.code === "auth/invalid-action-code") {
        message = t("errorlink");

      } else if (error?.code === "auth/expired-action-code") {
        message = t("errorlink");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        customClass: { popup: "minimal-alert" }
      });
    }

  })();

})();
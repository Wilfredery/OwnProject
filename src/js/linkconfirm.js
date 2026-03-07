/**
 * ============================================================
 *  EMAIL VERIFICATION CONFIRMATION MODULE (PRO VERSION)
 * ============================================================
 *
 * Handles verification links sent by Firebase.
 *
 * Improvements:
 * - Validates action mode from URL
 * - Verifies action code before applying it
 * - Prevents bots or prefetch from consuming code
 * - Handles additional Firebase errors
 * - Provides safer UX feedback
 *
 * ============================================================
 */

import Swal from "sweetalert2";
import {
  confirmEmailWithCode,
  checkEmailActionCode
} from "./auth.js";
import { t } from "./i18n/index.js";

(function () {

  const confirmTitle = document.querySelector(".confirm__title");
  if (!confirmTitle) return;

  const verifyBtn = document.getElementById("verify-email-btn");
  if (!verifyBtn) return;

  let alreadyHandled = false;

  /**
   * Action code injected from backend
   */
  const oobCode = window.__OOB_CODE__;

  /**
   * Validate mode from URL
   */
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if (!oobCode || mode !== "verifyEmail") {
    Swal.fire({
      icon: "error",
      title: t("errorlink"),
      customClass: { popup: "minimal-alert" }
    });
    return;
  }

  /* ==========================================================
     🔐 USER TRIGGERED VERIFICATION
  ========================================================== */

  verifyBtn.addEventListener("click", async () => {

    if (alreadyHandled) return;

    alreadyHandled = true;
    verifyBtn.disabled = true;

    try {

      /**
       * STEP 1
       * Validate action code before applying
       */
      await checkEmailActionCode(oobCode);

      /**
       * STEP 2
       * Apply verification
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
       * Secure redirect
       */
      window.location.replace("/login");

    } catch (error) {

      let message = t("errorlink");

      if (error?.code === "auth/invalid-action-code") {
        message = t("errorlink");

      } else if (error?.code === "auth/expired-action-code") {
        message = t("errorlink");

      } else if (error?.code === "auth/user-disabled") {
        message = t("errorlink");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        customClass: { popup: "minimal-alert" }
      });

      verifyBtn.disabled = false;
      alreadyHandled = false;
    }

  });

})();
/**
 * ============================================================
 *  FORGOT PASSWORD MODULE
 * ============================================================
 *
 * Handles password reset requests with client-side
 * protection mechanisms to prevent abuse/spam.
 *
 * Responsibilities:
 * - Basic email validation
 * - Prevent duplicate submissions
 * - Implement short cooldown (30s)
 * - Implement extended attempt window (15 min)
 * - Provide user feedback via SweetAlert
 *
 * Security Design:
 * - Uses localStorage to track attempts
 * - Limits reset attempts within time window
 * - Prevents rapid resend spam
 *
 * Note:
 * - Real rate limiting must also exist server-side.
 * - This is an additional UX/security layer.
 *
 * ============================================================
 */

import Swal from "sweetalert2";
import { sendPasswordReset } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {

  document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("forgot-form");
    if (!form) return;

    /**
     * Prevent duplicate listener attachment
     * (safety in case of re-rendering).
     */
    if (form.dataset.listenerAttached === "true") return;
    form.dataset.listenerAttached = "true";

    const emailInput = document.getElementById("forgot-email");
    const submitBtn = form.querySelector("button[type='submit']");
    let isSubmitting = false;

    /* ======================================================
       RATE LIMIT CONFIGURATION
    ====================================================== */

    const SHORT_COOLDOWN = 30;      // seconds between attempts
    const MAX_ATTEMPTS = 2;         // max attempts per window
    const WINDOW_MINUTES = 15;      // rolling time window
    const STORAGE_KEY = "forgotPasswordAttempts";

    /**
     * Retrieve stored attempt timestamps.
     */
    function getAttempts() {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    /**
     * Save attempt timestamps.
     */
    function saveAttempts(attempts) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    }

    /**
     * Remove attempts outside time window.
     */
    function cleanOldAttempts(attempts) {
      const windowMs = WINDOW_MINUTES * 60 * 1000;
      const now = Date.now();
      return attempts.filter(ts => now - ts < windowMs);
    }

    /**
     * Calculate remaining short cooldown time.
     */
    function getShortCooldownRemaining(attempts) {
      if (attempts.length === 0) return 0;

      const lastAttempt = attempts[attempts.length - 1];
      const elapsed = Math.floor((Date.now() - lastAttempt) / 1000);

      return SHORT_COOLDOWN - elapsed > 0
        ? SHORT_COOLDOWN - elapsed
        : 0;
    }

    /* ======================================================
       FORM SUBMISSION HANDLER
    ====================================================== */

    form.addEventListener("submit", async (e) => {

      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const email = emailInput.value.trim();

      /* ======================================================
         BASIC EMAIL VALIDATION
      ====================================================== */

      if (!email || !email.includes("@")) {
        Swal.fire({
          icon: "warning",
          title: t("requiredEmail"),
          text: t("writeEmail"),
          customClass: { popup: "minimal-alert" }
        });
        emailInput.focus();
        return;
      }

      let attempts = getAttempts();
      attempts = cleanOldAttempts(attempts);

      /* ======================================================
         EXTENDED LIMIT CHECK (WINDOW CONTROL)
      ====================================================== */

      if (attempts.length >= MAX_ATTEMPTS) {
        Swal.fire({
          icon: "warning",
          title: t("titleSecurity"),
          text: t("textSecurity"),
          customClass: { popup: "minimal-alert" }
        });
        return;
      }

      /* ======================================================
         SHORT COOLDOWN CHECK (ANTI-SPAM)
      ====================================================== */

      const remaining = getShortCooldownRemaining(attempts);

      if (remaining > 0) {
        Swal.fire({
          icon: "info",
          title: t("emailSent"),
          text: t("retrySpam").replace("${remaining}", remaining),
          customClass: { popup: "minimal-alert" }
        });
        return;
      }

      try {

        if (submitBtn) submitBtn.disabled = true;

        /**
         * Trigger Firebase password reset email.
         */
        await sendPasswordReset(email);

        /**
         * Store successful attempt timestamp.
         */
        attempts.push(Date.now());
        saveAttempts(attempts);

        Swal.fire({
          icon: "success",
          title: t("emailSent"),
          text: t("checkSpam"),
          allowOutsideClick: false,
          customClass: { popup: "minimal-alert" }
        });

        form.reset();

      } catch (error) {

        // console.error("Reset password error:", error.code);

        let message = t("errorForgot");

        if (error.code === "auth/too-many-requests") {
          message = t("manyRequests");
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          customClass: { popup: "minimal-alert" }
        });

      } finally {

        isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
      }

    });

  });

})();
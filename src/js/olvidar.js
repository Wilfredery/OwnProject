// src/js/olvidar.js
import Swal from "sweetalert2";
import { sendPasswordReset } from "./auth.js";
import { t } from "./i18n/index.js";

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgot-form");
    if (!form) return;

    if (form.dataset.listenerAttached === "true") return;
    form.dataset.listenerAttached = "true";

    const emailInput = document.getElementById("forgot-email");
    const submitBtn = form.querySelector("button[type='submit']");
    let isSubmitting = false;

    const SHORT_COOLDOWN = 30; // segundos
    const MAX_ATTEMPTS = 2; // intentos
    const WINDOW_MINUTES = 15; // ventana de tiempo
    const STORAGE_KEY = "forgotPasswordAttempts";

    function getAttempts() {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    function saveAttempts(attempts) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    }

    function cleanOldAttempts(attempts) {
      const windowMs = WINDOW_MINUTES * 60 * 1000;
      const now = Date.now();
      return attempts.filter(ts => now - ts < windowMs);
    }

    function getShortCooldownRemaining(attempts) {
      if (attempts.length === 0) return 0;
      const lastAttempt = attempts[attempts.length - 1];
      const elapsed = Math.floor((Date.now() - lastAttempt) / 1000);
      return SHORT_COOLDOWN - elapsed > 0
        ? SHORT_COOLDOWN - elapsed
        : 0;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const email = emailInput.value.trim();

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

      // 🛑 Límite extendido (ej: 3 intentos en 15 min)
      if (attempts.length >= MAX_ATTEMPTS) {
        Swal.fire({
          icon: "warning",
          title: t("titleSecurity"),
          text: t("textSecurity"),
          customClass: { popup: "minimal-alert" }
        });
        return;
      }

      // 🛑 Cooldown corto (30s)
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
        isSubmitting = true;
        if (submitBtn) submitBtn.disabled = true;

        await sendPasswordReset(email);

        // Registrar intento exitoso
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
        console.error("Reset password error:", error.code);

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
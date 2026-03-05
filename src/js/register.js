/**
 * ==========================================================
 *  REGISTER MODULE
 * ==========================================================
 *
 * Description:
 * Client-side module responsible for handling user registration.
 *
 * This file manages form validation, user account creation,
 * post-registration logout, user feedback, and redirection flow.
 *
 * Architectural Context:
 * - Authentication logic is delegated to auth.js.
 * - Localization is handled through the i18n translation layer.
 * - UI feedback is provided using SweetAlert2.
 *
 * Main Responsibilities:
 * - Validate user input before attempting account creation.
 * - Prevent duplicate submissions.
 * - Create a new account via signUpWithEmail().
 * - Immediately terminate the session after registration.
 * - Provide localized feedback to the user.
 * - Redirect to the login page after successful registration.
 *
 * Security Considerations:
 * - Prevents multiple submissions using an internal state flag.
 * - Enforces minimum nickname and password length.
 * - Validates email format using a regex pattern.
 * - Forces logout after registration to avoid unintended active sessions
 *   prior to email verification.
 *
 * Dependencies:
 * - sweetalert2
 * - ./auth.js
 * - ./i18n/index.js
 * ==========================================================
 */

import Swal from "sweetalert2";
import { signUpWithEmail, signOutUser } from "./auth.js";
import { t } from "./i18n/index.js";

// Registration form element
const form = document.getElementById("register-form");

// Input references
const nickInput = document.getElementById("register-nick");
const emailInput = document.getElementById("register-email");
const passInput = document.getElementById("register-pass");

// Prevents duplicate submissions
let isSubmitting = false;

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nickname = nickInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value;

    /* ==========================================================
       INPUT VALIDATION (Fail-Fast Strategy)
    ========================================================== */
    if (!nickname)
      return showError(nickInput, t("requiredNickname"), t("enterNickname"));

    if (nickname.length < 3)
      return showError(nickInput, t("shortNickname"), t("nicknameMinChars"));

    if (!email)
      return showError(emailInput, t("require"), t("writeEmail"));

    if (!validateEmail(email))
      return showError(emailInput, t("invalidEmail"), t("enterValidEmail"));

    if (!password)
      return showError(passInput, t("requiredPassword"), t("enterPassword"));

    if (password.length < 6)
      return showError(passInput, t("shortPassW"), t("amountPassW"));

    /* ==========================================================
       ACCOUNT CREATION FLOW
    ========================================================== */
    isSubmitting = true;

    try {
      // Create user account
      await signUpWithEmail(email, password, nickname);

      // Immediately terminate session to enforce email verification
      await signOutUser();

      Swal.fire({
        icon: "success",
        title: t("accCreated"),
        text: t("verifyEmailSent"),
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: { popup: "minimal-alert" }
      });

      // Reset form and redirect after notification
      setTimeout(() => {
        form.reset();
        window.location.href = "/login";
      }, 5000);

    } catch (error) {
      // console.error("Registration error:", error);

      let message = t("errorSignUp");

      if (error.code === "auth/email-already-in-use") {
        message = t("AccAlreadyExists");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        customClass: { popup: "minimal-alert" }
      });

    } finally {
      isSubmitting = false;
    }
  });
}

/* ==========================================================
   Helper Functions
========================================================== */

/**
 * Displays a warning alert and focuses the corresponding input.
 *
 * @param {HTMLElement} input - The input field to focus.
 * @param {string} title - Alert title.
 * @param {string} text - Alert description.
 */
function showError(input, title, text) {
  Swal.fire({
    icon: "warning",
    title,
    text,
    customClass: { popup: "minimal-alert" }
  });
  input.focus();
}

/**
 * Validates an email address using a basic regular expression.
 *
 * Note:
 * This validation ensures general format correctness.
 * It does not guarantee domain existence or email deliverability.
 *
 * @param {string} email - Email address to validate.
 * @returns {boolean} True if format is valid, otherwise false.
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
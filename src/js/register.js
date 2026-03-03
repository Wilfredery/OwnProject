// src/js/register.js
import Swal from "sweetalert2";
import { signUpWithEmail, signOutUser } from "./auth.js";
import { t } from "./i18n/index.js";

// Form
const form = document.getElementById("register-form");

// Inputs
const nickInput = document.getElementById("register-nick");
const emailInput = document.getElementById("register-email");
const passInput = document.getElementById("register-pass");

let isSubmitting = false; // 🔐 Anti doble submit

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nickname = nickInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value;

    /* ==========================
       VALIDACIONES - PRIMER ERROR
    ========================== */
    if (!nickname) return showError(nickInput, t("requiredNickname"), t("enterNickname"));
    if (nickname.length < 3) return showError(nickInput, t("shortNickname"), t("nicknameMinChars"));
    if (!email) return showError(emailInput, t("require"), t("writeEmail"));
    if (!validateEmail(email)) return showError(emailInput, t("invalidEmail"), t("enterValidEmail"));
    if (!password) return showError(passInput, t("requiredPassword"), t("enterPassword"));
    if (password.length < 6) return showError(passInput, t("shortPassW"), t("amountPassW"));

    /* ==========================
       BLOQUEAR SUBMIT Y REGISTRO
    ========================== */
    isSubmitting = true;

    try {
      await signUpWithEmail(email, password, nickname);
      await signOutUser();  // 🔐 Logout inmediato para evitar sesión activa

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

      // Reset y redirección después de 5s
      setTimeout(() => {
        form.reset();
        window.location.href = "/login";
      }, 5000);

    } catch (error) {
      console.error(error);
      let message = t("errorSignUp");
      if (error.code === "auth/email-already-in-use") message = t("AccAlreadyExists");

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

/* ==========================
   FUNCIONES AUXILIARES
========================== */
function showError(input, title, text) {
  Swal.fire({
    icon: "warning",
    title,
    text,
    customClass: { popup: "minimal-alert" }
  });
  input.focus();
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
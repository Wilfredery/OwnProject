// src/js/register.js
import Swal from "sweetalert2";
import { signUpWithEmail } from "./auth.js";
import {t} from "./i18n/i18n.js";

// Form
const form = document.getElementById("register-form");

// Inputs
const nickInput = document.getElementById("register-nick");
const emailInput = document.getElementById("register-email");
const passInput = document.getElementById("register-pass");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nickname = nickInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value;

    /* ==========================
       VALIDACIONES
    ========================== */

    if (!nickname) {
      return Swal.fire({
        icon: "warning",
        title: t("requiredNickname"),
        text: t("enterNickname"),
        customClass: { popup: "minimal-alert" },
      });
    }

    if (nickname.length < 3) {
      return Swal.fire({
        icon: "warning",
        title: t("shortNickname"),
        text: t("nicknameMinChars"),
        customClass: { popup: "minimal-alert" },
      });
    }

    if (!email) {
      return Swal.fire({
        icon: "warning",
        title: t("require"),
        text: t("writeEmail"),
        customClass: { popup: "minimal-alert" },
      });
    }

    if (!validateEmail(email)) {
      return Swal.fire({
        icon: "error",
        title: t("invalidEmail"),
        text: t("enterValidEmail"),
        customClass: { popup: "minimal-alert" },
      });
    }

    if (!password) {
      return Swal.fire({
        icon: "warning",
        title: t("requiredPassword"),
        text: t("enterPassword"),
        customClass: { popup: "minimal-alert" },
      });
    }

    if (password.length < 6) {
      return Swal.fire({
        icon: "error",
        title: t("shortPassW"),
        text: t("amountPassW"),
        customClass: { popup: "minimal-alert" },
      });
    }

    /* ==========================
       REGISTRO
    ========================== */

    try {
      const user = await signUpWithEmail(email, password);

      // Guardar nickname adicional (merge)
      await import("./firebase.js").then(({ db, doc, setDoc }) =>
        setDoc(
          doc(db, "users", user.uid),
          { nickname, provider: "email" },
          { merge: true }
        )
      );

      // ✅ Mensaje + redirección automática
      Swal.fire({
        icon: "success",
        title: t("accCreated"),
        text: t("verifyEmailSent"),
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: { popup: "minimal-alert" },
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 5000);

      form.reset();
    } catch (error) {
      console.error(error);

      let message = t("errorSignUp");

      if (error.code === "auth/email-already-in-use") {
        message = t("AccAlreadyExists");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        customClass: { popup: "minimal-alert" },
      });
    }
  });
}

// Validar email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// src/js/login.js
import Swal from "sweetalert2";
import {
  signInWithEmail,
  sendPasswordReset
} from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const forgotBtn = document.getElementById("forgot-btn");

  /* ==========================
     LOGIN EMAIL / PASSWORD
  ========================== */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-pass").value.trim();

      if (!email || !pass) {
        return Swal.fire("Error", "Completa todos los campos", "warning");
      }

      try {
        await signInWithEmail(email, pass);
        window.location.href = "/main";
      } catch (err) {
        let message = "Error al iniciar sesión";

        if (err.code === "auth/user-not-found") {
          message = "El usuario no existe";
        } else if (err.code === "auth/wrong-password") {
          message = "Contraseña incorrecta";
        }

        Swal.fire("Error", message, "error");
      }
    });
  }

  /* ==========================
     RESET PASSWORD
  ========================== */
  if (forgotBtn) {
    forgotBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const { value: email } = await Swal.fire({
        title: "Restablecer contraseña",
        input: "email",
        inputLabel: "Ingresa tu correo",
        inputPlaceholder: "correo@email.com",
        showCancelButton: true,
      });

      if (!email) return;

      try {
        await sendPasswordReset(email);
        Swal.fire("Listo", "Revisa tu correo", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo enviar el correo", "error");
      }
    });
  }
});

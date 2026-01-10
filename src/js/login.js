// src/js/login.js
import Swal from "sweetalert2";
import {
  signInWithEmail
} from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

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
});

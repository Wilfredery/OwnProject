// src/js/login.js
import Swal from "sweetalert2";

import {
  auth,
  provider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const googleBtn = document.getElementById("google-btn");
  const forgotBtn = document.getElementById("forgot-btn");

  /* ===========================
     LOGIN CON EMAIL Y PASSWORD
  =========================== */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-pass").value.trim();

      if (!email || !pass) {
        return Swal.fire("Error", "Completa todos los campos", "warning");
      }

      try {
        await signInWithEmailAndPassword(auth, email, pass);
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

  /* ===========================
     LOGIN CON GOOGLE
  =========================== */
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, provider);
        window.location.href = "/main";
      } catch (err) {
        Swal.fire("Error", "No se pudo iniciar con Google", "error");
      }
    });
  }

  /* ===========================
     RECUPERAR CONTRASEÑA
  =========================== */
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
        await sendPasswordResetEmail(auth, email);
        Swal.fire("Listo", "Revisa tu correo", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo enviar el correo", "error");
      }
    });
  }
});

// src/js/olvidar.js
import Swal from "sweetalert2";
import { auth, sendPasswordResetEmail } from "./firebase.js";

const form = document.getElementById("forgot-form");

if (form) {
  const emailInput = document.getElementById("forgot-email");
  let isSubmitting = false; // 🔒 evita doble envío

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // 🛑 bloqueo real
    isSubmitting = true;

    const email = emailInput.value.trim();

    if (!email) {
      isSubmitting = false;
      return Swal.fire({
        icon: "warning",
        title: "Correo requerido",
        text: "Escribe tu correo electrónico",
        customClass: { popup: "minimal-alert" },
      });
    }

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      Swal.fire({
        icon: "success",
        title: "Correo enviado 📩",
        text: "Revisa tu correo para restablecer tu contraseña. Si no lo ves, revisa la carpeta de spam.",
        customClass: { popup: "minimal-alert" },
      });

      form.reset();
    } catch (error) {
      let msg = "Ocurrió un error, intenta nuevamente";

      if (error.code === "auth/user-not-found") {
        msg = "No existe una cuenta con ese correo";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        customClass: { popup: "minimal-alert" },
      });
    } finally {
      isSubmitting = false; // 🔓 libera el bloqueo
    }
  });
}

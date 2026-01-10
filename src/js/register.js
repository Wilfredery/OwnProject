// src/js/register.js
import Swal from "sweetalert2";
import { signUpWithEmail } from "./auth.js";

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
        title: "Nickname requerido",
        text: "Por favor ingresa un nombre de usuario",
        customClass: { popup: "minimal-alert" },
      });
    }

    if (nickname.length < 3) {
      return Swal.fire({
        icon: "warning",
        title: "Nickname muy corto",
        text: "Debe tener al menos 3 caracteres",
        customClass: { popup: "minimal-alert" },
      });
    }

    if (!email) {
      return Swal.fire({
        icon: "warning",
        title: "Email requerido",
        text: "Por favor ingresa tu correo",
        customClass: { popup: "minimal-alert" },
      });
    }

    if (!validateEmail(email)) {
      return Swal.fire({
        icon: "error",
        title: "Email inválido",
        text: "Ingresa un correo válido",
        customClass: { popup: "minimal-alert" },
      });
    }

    if (!password) {
      return Swal.fire({
        icon: "warning",
        title: "Contraseña requerida",
        text: "Por favor ingresa una contraseña",
        customClass: { popup: "minimal-alert" },
      });
    }

    if (password.length < 6) {
      return Swal.fire({
        icon: "error",
        title: "Contraseña muy corta",
        text: "Debe tener al menos 6 caracteres",
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
        title: "Cuenta creada 🎉",
        text: "Te enviamos un correo para verificar tu cuenta",
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

      let message = "Ocurrió un error al registrar";

      if (error.code === "auth/email-already-in-use") {
        message = "Este correo ya está registrado";
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

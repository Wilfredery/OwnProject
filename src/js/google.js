// src/js/google.js
import Swal from "sweetalert2";
import { signInWithGoogle } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("google-btn");
  if (!googleBtn) return;

  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithGoogle();
      window.location.href = "/main";
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "No se pudo iniciar sesión con Google",
        "error"
      );
    }
  });
});

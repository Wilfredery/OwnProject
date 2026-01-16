// src/js/google.js
import Swal from "sweetalert2";
import { signInWithGoogle } from "./auth.js";
import {t} from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("google-btn");
  if (!googleBtn) return;

  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithGoogle();
      window.location.href = "/main";
    } catch (err) {
      console.error(err);
      Swal.fire( {
        title: "Error",
        text: t("errorGoogleSignIn"),
        icon: "error",
        customClass: { popup: "minimal-alert" }
      });
    }
  });
});

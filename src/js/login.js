// src/js/login.js
import Swal from "sweetalert2";
import {
  signInWithEmail
} from "./auth.js";
import { t } from "./i18n/index.js";

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
        return Swal.fire({
          title:"Error", 
          text:t("errorCamposEmpty"), 
          icon:"warning", 
          customClass: { 
            popup: "minimal-alert" 
          }
        });
      }

      try {
        await signInWithEmail(email, pass);
        window.location.href = "/main";
      } catch (err) {
        let message = t("errorLoginExist");

        if (err.code === "auth/user-not-found") {
          message = t("errorUserNotFound");
        } else if (err.code === "auth/wrong-password") {
          message = t("errorLoginPassW");
        }

        Swal.fire({
          title: "Error",
          text: message,
          icon: "error",
          customClass: { 
            popup: "minimal-alert" 
          }
        });
      }
    });
  }
});

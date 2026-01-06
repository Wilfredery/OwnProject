/* ======================================================
   CUSTOM SELECTS (UI) – TU CÓDIGO ORIGINAL PROTEGIDO
====================================================== */

const customSelects = document.querySelectorAll(".custom-select");

if (customSelects.length > 0) {
  customSelects.forEach((customSelect) => {
    const selected = customSelect.querySelector(".selected");
    const options = customSelect.querySelectorAll(".options li");

    if (!selected || options.length === 0) return;

    selected.addEventListener("click", () => {
      customSelect.classList.toggle("open");
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        selected.textContent = option.textContent;
        customSelect.classList.remove("open");
      });
    });
  });
}

/* ======================================================
   ACCOUNT & SETTINGS – AUTH STATE
====================================================== */

import { auth, onAuthStateChanged, signOut } from "./firebase.js";
import Swal from "sweetalert2";

// Elementos del DOM (CLASE CORRECTA)
const userNameEl = document.querySelector(".settings__user--userName");
const logoutBtn = document.getElementById("logout-btn");
const changePassBtn = document.getElementById("change-password-btn");

if (userNameEl) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Usuario logeado
      userNameEl.textContent =
        user.displayName || user.email || "Usuario";

      if (logoutBtn) logoutBtn.disabled = false;
      if (changePassBtn) changePassBtn.disabled = false;
    } else {
      // Guest
      userNameEl.textContent = "Guest";

      if (logoutBtn) logoutBtn.disabled = true;
      if (changePassBtn) changePassBtn.disabled = true;
    }
  });
}

/* ======================================================
   LOGOUT CON CONFIRMACIÓN
====================================================== */

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (logoutBtn.disabled) return;

    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await signOut(auth);
      window.location.href = "/";
    }
  });
}

/* ======================================================
   CAMBIAR CONTRASEÑA
====================================================== */

if (changePassBtn) {
  changePassBtn.addEventListener("click", () => {
    if (changePassBtn.disabled) return;
    window.location.href = "/forgot-password";
  });
}

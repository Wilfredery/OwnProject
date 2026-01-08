/* ======================================================
   ACCOUNT & SETTINGS – AUTH (USANDO auth.js)
====================================================== */

import { initAuthListener, signOutUser } from "./auth.js";
import Swal from "sweetalert2";

// Elementos del DOM
const userNameEl = document.querySelector(".settings__user--userName");
const logoutBtn = document.getElementById("logout-btn");
const changePassBtn = document.getElementById("change-password-btn");

/* ======================================================
   ESTADO INICIAL (ANTES DE FIREBASE)
====================================================== */

if (userNameEl) {
  userNameEl.textContent = "Cargando...";
}

if (logoutBtn) logoutBtn.disabled = true;
if (changePassBtn) changePassBtn.disabled = true;

/* ======================================================
   AUTH STATE (UN SOLO LISTENER – CENTRALIZADO)
====================================================== */

if (userNameEl) {
  initAuthListener({
    onSignedIn: (user) => {
      userNameEl.textContent =
        user.displayName || user.email || "Usuario";

      if (logoutBtn) logoutBtn.disabled = false;
      if (changePassBtn) changePassBtn.disabled = false;
    },

    onSignedOut: () => {
      userNameEl.textContent = "Guest";

      if (logoutBtn) logoutBtn.disabled = true;
      if (changePassBtn) changePassBtn.disabled = true;
    }
  });
}

/* ======================================================
   LOGOUT CON SWEETALERT (FLUJO CORRECTO)
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
      customClass: {
          popup: 'minimal-alert'
      },
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await signOutUser(); // 👈 auth.js es la única salida
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

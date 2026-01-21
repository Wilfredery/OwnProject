/* ======================================================
   ACCOUNT & SETTINGS – AUTH (USANDO onAuthReady)
====================================================== */

import { onAuthReady, signOutUser } from "./auth.js";
import Swal from "sweetalert2";

// Elementos del DOM
const userNameEl = document.querySelector(".settings__user--userName");
const logoutBtn = document.getElementById("logout-btn");
const changePassBtn = document.getElementById("change-password-btn");

/* ======================================================
   ESTADO INICIAL
====================================================== */

if (userNameEl) userNameEl.textContent = "Cargando...";
if (logoutBtn) logoutBtn.disabled = true;
if (changePassBtn) changePassBtn.disabled = true;

/* ======================================================
   AUTH READY (UNA SOLA VEZ – LIMPIO)
====================================================== */

(async function () {
  if (!userNameEl) return;

  const user = await onAuthReady();

  // ⛔ No hay usuario válido
  if (!user) {
    userNameEl.textContent = "Guest";
    return;
  }

  // ✅ Usuario válido
  userNameEl.textContent =
    user.displayName || user.email || "Usuario";

  if (logoutBtn) logoutBtn.disabled = false;
  if (changePassBtn) changePassBtn.disabled = false;
})();

/* ======================================================
   LOGOUT CON SWEETALERT
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
      customClass: {
        popup: "minimal-alert",
      },
    });

    if (result.isConfirmed) {
      await signOutUser();
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

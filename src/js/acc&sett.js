/* ======================================================
   ACCOUNT & SETTINGS – AUTH (3 ESTADOS)
====================================================== */

import { onAuthReady, signOutUser } from "./auth.js";
import { getCachedAuthState, resolveAuthState } from "./authState.js";
import Swal from "sweetalert2";
import { t } from "./i18n/index.js";

// Elementos del DOM
const userNameEl = document.querySelector(".settings__user--userName");
const logoutBtn = document.getElementById("logout-btn");
const changePassBtn = document.getElementById("change-password-btn");

/* ======================================================
   ESTADO INICIAL (NEUTRO)
====================================================== */

if (userNameEl) userNameEl.textContent = "...";
if (logoutBtn) logoutBtn.disabled = true;
if (changePassBtn) changePassBtn.disabled = true;

/* ======================================================
   ⚡ UX INMEDIATA (CACHE)
====================================================== */

const cachedState = getCachedAuthState();

if (cachedState === "verified") {
  if (logoutBtn) logoutBtn.disabled = false;
  if (changePassBtn) changePassBtn.disabled = false;
}

if (cachedState === "unverified") {
  if (logoutBtn) logoutBtn.disabled = false;
  if (changePassBtn) changePassBtn.disabled = true;
}

/* ======================================================
   🔐 CONFIRMACIÓN REAL (FIREBASE)
====================================================== */

(async function () {
  if (!userNameEl) return;

  const authState = await onAuthReady();

  /* =========================
     👤 GUEST
  ========================= */
  if (authState.role === "guest") {
    userNameEl.textContent = t("guest");
    return;
  }

  const user = authState.user;

  // 🔄 SIEMPRE sincronizar estado real
  await user.reload();

  // 🔓 Logout siempre activo si hay sesión
  logoutBtn.disabled = false;

  /* =========================
     🟡 NO VERIFICADO
  ========================= */
  if (!user.emailVerified) {
    userNameEl.textContent = t("UserNotVerfied");
    changePassBtn.disabled = true;
    return;
  }

  /* =========================
     ✅ VERIFICADO
  ========================= */
  userNameEl.textContent =
    user.displayName || user.email;

  const isEmailProvider =
    user.providerData[0]?.providerId === "password";

  changePassBtn.disabled = !isEmailProvider;
})();

/* ======================================================
   LOGOUT
====================================================== */

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (logoutBtn.disabled) return;

    const result = await Swal.fire({
      title: t("tittleCloseSession"),
      text: t("textCloseSession"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("confirmCloseSession"),
      cancelButtonText: t("cancerlCloseSession"),
      customClass: { popup: "minimal-alert" }
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

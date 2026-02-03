// src/js/auth-ui.js
import { onAuthReady } from "./auth.js";

function showGuestUI() {
  const guestLogin = document.getElementById("guest-controls");
  const guestRegister = document.getElementById("guest-controls-register");
  const userControls = document.getElementById("user-controls");

  if (guestLogin) guestLogin.style.display = "block";
  if (guestRegister) guestRegister.style.display = "block";
  if (userControls) userControls.style.display = "none";
}

function showUserUI(user) {
  const guestLogin = document.getElementById("guest-controls");
  const guestRegister = document.getElementById("guest-controls-register");
  const userControls = document.getElementById("user-controls");

  if (guestLogin) guestLogin.style.display = "none";
  if (guestRegister) guestRegister.style.display = "none";
  if (userControls) userControls.style.display = "flex";

  const nameEl = document.getElementById("user-name");
  const photoEl = document.getElementById("user-photo");

  if (nameEl) {
    nameEl.textContent = user.displayName || user.email;
  }

  if (photoEl) {
    photoEl.src = user.photoURL || "/img/default-avatar.png";
  }
}

async function initHeaderAuthUI() {
  const header = document.getElementById("main-header");

  try {
    const user = await onAuthReady();

    // ✅ CLAVE: el guest (anónimo) se trata como NO logueado
    if (user && !user.isAnonymous) {
      showUserUI(user);
    } else {
      showGuestUI();
    }

  } catch (error) {
    console.error("Auth UI error:", error);
    showGuestUI();
  } finally {
    // Mostrar header cuando todo esté listo
    if (header) header.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", initHeaderAuthUI);

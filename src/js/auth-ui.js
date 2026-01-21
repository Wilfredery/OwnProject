// src/js/auth-ui.js
import { onAuthReady } from "./auth.js";

function showGuestUI() {
  const guest1 = document.getElementById("guest-controls");
  const guest2 = document.getElementById("guest-controls-register");
  const userC = document.getElementById("user-controls");

  if (guest1) guest1.style.display = "block";
  if (guest2) guest2.style.display = "block";
  if (userC) userC.style.display = "none";
}

function showUserUI(user) {
  const guest1 = document.getElementById("guest-controls");
  const guest2 = document.getElementById("guest-controls-register");
  const userC = document.getElementById("user-controls");

  if (guest1) guest1.style.display = "none";
  if (guest2) guest2.style.display = "none";
  if (userC) userC.style.display = "flex";

  const nameEl = document.getElementById("user-name");
  const photoEl = document.getElementById("user-photo");

  if (nameEl) {
    nameEl.textContent =
      user.isAnonymous
        ? "Guest"
        : user.displayName || user.email;
  }

  if (photoEl) {
    photoEl.src = user.photoURL || "/img/default-avatar.png";
  }
}

async function initHeaderAuthUI() {
  const header = document.getElementById("main-header");

  try {
    const user = await onAuthReady();

    if (user) {
      showUserUI(user);
    } else {
      showGuestUI();
    }

  } catch (error) {
    console.error("Auth UI error:", error);
    showGuestUI();
  } finally {
    // 🔥 AQUÍ se muestra el header
    if (header) header.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", initHeaderAuthUI);
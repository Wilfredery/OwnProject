// src/js/auth-ui.js
import { initAuthListener, signOutUser } from "./auth.js";

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

    if (nameEl) nameEl.textContent = user.displayName || user.email;
    if (photoEl) photoEl.src = user.photoURL || "/img/default-avatar.png";
}

export function initHeaderAuthUI() {
    initAuthListener({
        onSignedIn(user) {
            showUserUI(user);
        },
        onSignedOut() {
            showGuestUI();
        }
    });

    // Botón de logout
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest("#logout-btn");
        if (!btn) return;

        await signOutUser();
        location.reload();
    });
}

// Ejecutar automáticamente al cargar
document.addEventListener("DOMContentLoaded", initHeaderAuthUI);

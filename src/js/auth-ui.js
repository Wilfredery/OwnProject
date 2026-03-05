/**
 * ============================================================
 *  HEADER AUTH UI CONTROLLER
 * ============================================================
 *
 * This module manages the header UI based on
 * the current authentication state.
 *
 * Responsibilities:
 * - Show guest controls (login/register)
 * - Show authenticated user controls
 * - Display user name and profile photo
 * - Prevent UI flicker during auth resolution
 *
 * Integration:
 * - Firebase Auth (via onAuthReady)
 *
 * ============================================================
 */

import { onAuthReady } from "./auth.js";

/* ============================================================
   GUEST UI
============================================================ */

/**
 * Displays UI elements intended for guest users.
 * Hides authenticated user controls.
 */
function showGuestUI() {

  const guestLogin = document.getElementById("guest-controls");
  const guestRegister = document.getElementById("guest-controls-register");
  const userControls = document.getElementById("user-controls");

  if (guestLogin) guestLogin.style.display = "block";
  if (guestRegister) guestRegister.style.display = "block";
  if (userControls) userControls.style.display = "none";
}

/* ============================================================
   AUTHENTICATED USER UI
============================================================ */

/**
 * Displays authenticated user controls
 * and populates user information.
 *
 * @param {Object} user - Firebase user object
 */
function showUserUI(user) {

  const guestLogin = document.getElementById("guest-controls");
  const guestRegister = document.getElementById("guest-controls-register");
  const userControls = document.getElementById("user-controls");

  if (guestLogin) guestLogin.style.display = "none";
  if (guestRegister) guestRegister.style.display = "none";
  if (userControls) userControls.style.display = "flex";

  const nameEl = document.getElementById("user-name");
  const photoEl = document.getElementById("user-photo");

  /**
   * Display user name (fallback to email if displayName not set)
   */
  if (nameEl) {
    nameEl.textContent = user.displayName || user.email;
  }

  /**
   * Display profile photo (fallback to default avatar)
   */
  if (photoEl) {
    photoEl.src = user.photoURL || "/img/default-avatar.png";
  }
}

/* ============================================================
   INITIALIZATION
============================================================ */

/**
 * Initializes header authentication UI.
 *
 * Behavior:
 * - Waits for Firebase auth resolution
 * - Treats anonymous users as guests
 * - Displays appropriate UI state
 * - Ensures header is revealed only after auth check
 */
async function initHeaderAuthUI() {

  const header = document.getElementById("main-header");

  try {

    const user = await onAuthReady();

    /**
     * Anonymous users are treated as guests
     * (not considered fully authenticated).
     */
    if (user && !user.isAnonymous) {
      showUserUI(user);
    } else {
      showGuestUI();
    }

  } catch (error) {

    // console.error("Auth UI error:", error);
    showGuestUI();

  } finally {

    /**
     * Remove hidden state once UI is ready
     * to prevent visual flicker.
     */
    if (header) header.classList.remove("hidden");
  }
}

/* ============================================================
   DOM READY
============================================================ */

document.addEventListener("DOMContentLoaded", initHeaderAuthUI);
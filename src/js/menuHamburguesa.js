/**
 * ============================================================
 *  HAMBURGER MENU MODULE
 * ============================================================
 *
 * Controls:
 * - Mobile hamburger open/close behavior
 * - Role-based menu UI rendering
 * - Protected navigation links
 * - Instant UX via cached auth state
 * - Real validation via Firebase
 *
 * Security Model:
 * - UI locking is client-side only
 * - Real access control must be validated server-side
 *
 * Design Goals:
 * - Prevent unverified users from accessing restricted routes
 * - Avoid UI flicker using cached auth state
 * - Provide clear feedback using SweetAlert
 *
 * ============================================================
 */

import Swal from "sweetalert2";
import { onAuthReady } from "./auth.js";
import { getCachedAuthState } from "./authState.js";
import { t } from "./i18n/index.js";

(function () {

  document.addEventListener("DOMContentLoaded", async () => {

    const menuBtn = document.querySelector(".menu-btn");
    const menuContainer = document.querySelector(".menu-container");

    if (!menuBtn || !menuContainer) return;

    /* ===============================
       MENU TOGGLE BEHAVIOR
       - Stops propagation to prevent
         immediate closing
       - Closes when clicking outside
    =============================== */

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuContainer.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!menuContainer.contains(e.target) && !menuBtn.contains(e.target)) {
        menuContainer.classList.remove("open");
      }
    });

    /* ===============================
       ROLE-BASED UI SWITCHING
       - guest controls visible for guests
       - user controls visible for logged users
    =============================== */

    function showGuestMenuUI() {
      const guest1 = document.getElementById("guest-controls");
      const guest2 = document.getElementById("guest-controls-register");
      const userC = document.getElementById("user-controls");

      if (guest1) guest1.style.display = "block";
      if (guest2) guest2.style.display = "block";
      if (userC) userC.style.display = "none";
    }

    function showUserMenuUI() {
      const guest1 = document.getElementById("guest-controls");
      const guest2 = document.getElementById("guest-controls-register");
      const userC = document.getElementById("user-controls");

      if (guest1) guest1.style.display = "none";
      if (guest2) guest2.style.display = "none";
      if (userC) userC.style.display = "flex";
    }

    /* ===============================
       🔗 PROTECTED LINKS SYSTEM
       - Blocks /search and /crear
       - Removes href dynamically
       - Shows verification alert
    =============================== */

    const blockedLinks = document.querySelectorAll(
      '.dropdown-menu a[href="/search"], .dropdown-menu a[href="/crear"]'
    );

    /**
     * Locks restricted links:
     * - Removes href
     * - Stores original href in data attribute
     * - Adds locked class
     * - Injects alert behavior
     */
    function lockLinks() {
      blockedLinks.forEach((link) => {

        if (link.dataset.locked) return;

        link.dataset.locked = "true";
        link.dataset.href = link.getAttribute("href");
        link.removeAttribute("href");
        link.classList.add("link--locked");

        link.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          menuContainer.classList.remove("open");

          Swal.fire({
            icon: "info",
            title: t("titleplsverifyemail"),
            text: t("plsverifyemail"),
            confirmButtonText: t("confirmplsverifyemail"),
            customClass: { popup: "minimal-alert" }
          });
        });
      });
    }

    /**
     * Restores original href and unlocks links.
     */
    function unlockLinks() {
      blockedLinks.forEach((link) => {

        if (!link.dataset.href) return;

        link.setAttribute("href", link.dataset.href);
        link.classList.remove("link--locked");
        delete link.dataset.locked;
      });
    }

    /* ===============================
       ⚡ INSTANT UX VIA CACHE
       - Prevents flicker
       - Applies restrictions immediately
    =============================== */

    const cachedState = getCachedAuthState();

    if (cachedState === "unverified") {
      lockLinks();
    }

    /* ===============================
       🔐 REAL AUTH VALIDATION (FIREBASE)
       - Authoritative role check
       - Syncs email verification status
    =============================== */

    const authState = await onAuthReady();

    /* 👤 GUEST USER */
    if (authState.role === "guest") {
      showGuestMenuUI();
      unlockLinks();
      return;
    }

    /* 👤 AUTHENTICATED USER */
    const user = authState.user;
    showUserMenuUI();

    /**
     * Force refresh of emailVerified state
     * to ensure accurate validation.
     */
    await user.reload();

    /**
     * Access allowed if:
     * - Email verified
     * - OR authenticated via Google
     */
    const isAllowed =
      user.emailVerified ||
      user.providerData[0]?.providerId === "google.com";

    if (isAllowed) {
      unlockLinks();
    } else {
      lockLinks();
    }

  });

})();
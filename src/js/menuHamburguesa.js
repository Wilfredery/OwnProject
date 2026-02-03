// src/js/menuhamburguesa.js
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
       ABRIR / CERRAR MENÚ
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
       UI SEGÚN ROL
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
       🔗 LINKS PROTEGIDOS
    =============================== */
    const blockedLinks = document.querySelectorAll(
      '.dropdown-menu a[href="/search"], .dropdown-menu a[href="/crear"]'
    );

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

    function unlockLinks() {
      blockedLinks.forEach((link) => {
        if (!link.dataset.href) return;

        link.setAttribute("href", link.dataset.href);
        link.classList.remove("link--locked");
        delete link.dataset.locked;
      });
    }

    /* ===============================
       ⚡ UX INMEDIATA (CACHE)
    =============================== */
    const cachedState = getCachedAuthState();

    if (cachedState === "unverified") {
      lockLinks();
    }

    /* ===============================
       🔐 CONFIRMACIÓN REAL (FIREBASE)
    =============================== */
    const authState = await onAuthReady();

    // 👤 GUEST
    if (authState.role === "guest") {
      showGuestMenuUI();
      unlockLinks();
      return;
    }

    // 👤 USUARIO LOGEADO
    const user = authState.user;
    showUserMenuUI();

    // 🔄 sincronizar estado real
    await user.reload();

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

// src/js/menuhamburguesa.js
import Swal from "sweetalert2";
import { onAuthReady } from "./auth.js";
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
       🔐 AUTH REAL
    =============================== */
    const authState = await onAuthReady();

    // 👤 GUEST → no bloqueamos
    if (authState.role === "guest") return;

    const user = authState.user;

    // 🔄 aseguramos estado actualizado
    await user.reload();

    const isAllowed =
      user.emailVerified ||
      user.providerData[0]?.providerId === "google.com";

    // 🟢 VERIFICADO → acceso total
    if (isAllowed) return;

    /* ===============================
       🟡 NO VERIFICADO → BLOQUEO REAL
    =============================== */
    const blockedLinks = document.querySelectorAll(
      '.dropdown-menu a[href="/search"], .dropdown-menu a[href="/crear"]'
    );

    blockedLinks.forEach((link) => {
      // 🔐 guardamos destino y quitamos href
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
  });
})();

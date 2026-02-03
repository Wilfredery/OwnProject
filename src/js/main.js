// src/js/main.js
import { db, onAuthReady } from "./auth.js";
import { getCachedAuthState } from "./authState.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { applyTranslations, t } from "./i18n/index.js";
import Swal from "sweetalert2";

(async function () {

  // ⛔ No estamos en main.ejs
  const createBtn = document.querySelector(".create-btn");
  const searchBtn = document.querySelector(".search-btn");
  if (!createBtn || !searchBtn) return;

  let isAllowed = false; // 🔐 control central

  /* ==========================================================
     CLICK PROTEGIDO
  ========================================================== */
  function guardedClick(e) {
    e.preventDefault();

    if (!isAllowed) {
      Swal.fire({
        icon: "info",
        title: t("titleplsverifyemail"),
        text: t("plsverifyemail"),
        confirmButtonText: t("confirmplsverifyemail"),
        customClass: { popup: "minimal-alert" }
      });
      return;
    }

    const href = e.currentTarget.dataset.href;
    if (href) window.location.href = href;
  }

  createBtn.addEventListener("click", guardedClick);
  searchBtn.addEventListener("click", guardedClick);

  // 🔒 bloqueados por defecto (seguridad)
  createBtn.classList.add("btn--locked");
  searchBtn.classList.add("btn--locked");

  /* ==========================================================
     ⚡ UX INMEDIATA (CACHE)
  ========================================================== */
  const cachedState = getCachedAuthState();

  if (cachedState === "guest" || cachedState === "verified") {
    isAllowed = true;
    createBtn.classList.remove("btn--locked");
    searchBtn.classList.remove("btn--locked");
  }

  /* ==========================================================
     🔐 CONFIRMACIÓN REAL (FIREBASE)
  ========================================================== */
  const authState = await onAuthReady();
  if (!authState) return;

  isAllowed = false;

  /* =========================
     👤 GUEST → permitido
  ========================= */
  if (authState.role === "guest") {
    isAllowed = true;
  }

  /* =========================
     🟢 VERIFICADO → permitido
  ========================= */
  if (authState.role === "verified") {
    isAllowed = true;
  }

  if (!isAllowed) return;

  // 🔓 desbloqueo final confirmado
  createBtn.classList.remove("btn--locked");
  searchBtn.classList.remove("btn--locked");

  /* ==========================================================
     🔥 CONTAR NOTAS (solo verificados)
  ========================================================== */
  if (authState.role !== "verified") return;

  const q = query(
    collection(db, "notes"),
    where("uid", "==", authState.user.uid)
  );

  const snapshot = await getDocs(q);
  const notesCount = snapshot.size;

  const textSpan = createBtn.querySelector(".btn-text");
  const key =
    notesCount === 0
      ? createBtn.dataset.emptyText
      : createBtn.dataset.normalText;

  textSpan.dataset.i18n = key;
  applyTranslations(createBtn);

})();

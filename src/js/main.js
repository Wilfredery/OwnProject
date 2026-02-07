// src/js/main.js
import { db, onAuthReady } from "./auth.js";
import { getCachedAuthState } from "./authState.js";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { applyTranslations } from "./i18n/index.js";

(async function () {

  const createBtn = document.querySelector(".create-btn");
  const searchBtn = document.querySelector(".search-btn");
  if (!createBtn || !searchBtn) return;

  let isAllowed = false;

  function guardedClick(e) {
    e.preventDefault();
    if (!isAllowed) return;

    const href = e.currentTarget.dataset.href;
    if (href) window.location.href = href;
  }

  createBtn.addEventListener("click", guardedClick);
  searchBtn.addEventListener("click", guardedClick);

  createBtn.classList.add("btn--locked");
  searchBtn.classList.add("btn--locked");

  /* ======================================================
     ⚡ CACHE
  ====================================================== */

  const cachedState = getCachedAuthState();
  if (cachedState === "guest" || cachedState === "verified" || cachedState === "user") {
    isAllowed = true;
    createBtn.classList.remove("btn--locked");
    searchBtn.classList.remove("btn--locked");
  }

  /* ======================================================
     🔐 FIREBASE REAL
  ====================================================== */

  const authState = await onAuthReady();
  if (!authState) return;

  isAllowed =
    authState.role === "guest" ||
    authState.role === "verified" ||
    authState.role === "user";

  if (!isAllowed) return;

  createBtn.classList.remove("btn--locked");
  searchBtn.classList.remove("btn--locked");

  /* ======================================================
     💡 MIGRACIÓN AUTOMÁTICA (SIN SWEETALERT AQUÍ)
  ====================================================== */

  if (authState.role === "verified" && window.runGuestMigration) {
    const userRef = doc(db, "users", authState.user.uid);
    const snap = await getDoc(userRef);

    const alreadyMigrated =
      snap.exists() && snap.data().guestMigrationDone;

    const guestNotes =
      JSON.parse(localStorage.getItem("guestNotes")) || [];

    if (!alreadyMigrated && guestNotes.length > 0) {
      // 👉 TODA la UX vive en acc&sett.js
      await window.runGuestMigration();
    }
  }

  /* ======================================================
     🔥 CONTAR NOTAS
  ====================================================== */

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

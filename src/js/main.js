// src/js/main.js
import { db, onAuthReady } from "./auth.js";
import { getCachedAuthState } from "./authState.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";
import { applyTranslations } from "./i18n/index.js";

(async function () {

  /* ======================================================
     🔘 BOTONES CREATE / SEARCH
  ====================================================== */

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
  if (["guest", "verified", "user"].includes(cachedState)) {
    isAllowed = true;
    createBtn.classList.remove("btn--locked");
    searchBtn.classList.remove("btn--locked");
  }

  /* ======================================================
     🔐 FIREBASE REAL
  ====================================================== */

  const authState = await onAuthReady();
  if (!authState) return;

  isAllowed = ["guest", "verified", "user"].includes(authState.role);
  if (!isAllowed) return;

  createBtn.classList.remove("btn--locked");
  searchBtn.classList.remove("btn--locked");

  /* ======================================================
     🧭 GUÍA DINÁMICA (BEM CORRECTO)
  ====================================================== */

  const steps = document.querySelectorAll(".guide-content__step");
  const nextBtn = document.querySelector(".guide-content__nav-btn.next");
  const prevBtn = document.querySelector(".guide-content__nav-btn.prev");

  if (steps.length && nextBtn && prevBtn) {
    let current = 0;

    function updateGuide() {
      steps.forEach((step, i) => {
        step.classList.toggle(
          "guide-content__step--active",
          i === current
        );
      });
    }

    nextBtn.addEventListener("click", () => {
      current = (current + 1) % steps.length;
      updateGuide();
    });

    prevBtn.addEventListener("click", () => {
      current = (current - 1 + steps.length) % steps.length;
      updateGuide();
    });

    updateGuide();
  }

  /* ======================================================
     🔍 ZOOM DE IMAGEN (picture + webp)
  ====================================================== */

  const mediaItems = document.querySelectorAll(".guide-content__media");

  if (mediaItems.length) {
    const overlay = document.createElement("div");
    overlay.className = "img-overlay";
    document.body.appendChild(overlay);

    const zoomImg = document.createElement("img");
    zoomImg.className = "img-overlay__img";
    overlay.appendChild(zoomImg);

    mediaItems.forEach(picture => {
      const img = picture.querySelector("img");

      picture.addEventListener("click", () => {
        zoomImg.src = img.currentSrc || img.src;
        overlay.classList.add("is-visible");
      });
    });

    overlay.addEventListener("click", () => {
      overlay.classList.remove("is-visible");
      zoomImg.src = "";
    });
  }

  /* ======================================================
     💡 MIGRACIÓN AUTOMÁTICA
  ====================================================== */

  if (authState.role === "verified" && window.runGuestMigration) {
    const userRef = doc(db, "users", authState.user.uid);
    const snap = await getDoc(userRef);

    const alreadyMigrated =
      snap.exists() && snap.data().guestMigrationDone;

    const guestNotes =
      JSON.parse(localStorage.getItem("guestNotes")) || [];

    if (!alreadyMigrated && guestNotes.length > 0) {
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
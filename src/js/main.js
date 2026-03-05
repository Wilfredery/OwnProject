/**
 * ============================================================
 *  MAIN DASHBOARD MODULE
 * ============================================================
 *
 * Central controller for main page behavior.
 *
 * Responsibilities:
 * - Apply translations (i18n)
 * - Handle language-based guide image swapping
 * - Manage create/search button permissions
 * - Sync cached auth state with Firebase
 * - Guide step navigation
 * - Image zoom overlay
 * - Guest → verified migration logic
 * - Notes counting for UI feedback
 *
 * Architecture Notes:
 * - Uses two-layer auth validation (cache + Firebase)
 * - UI restrictions are UX-only (real validation happens server-side)
 * - Migration system is idempotent (safe against duplicates)
 * - Image system prevents flicker using preloading
 *
 * ============================================================
 */

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
import { applyTranslations, getLang } from "./i18n/index.js";

(async function () {

  /**
   * Apply translations immediately on load.
   */
  applyTranslations();

  /* ======================================================
     🌍 GUIDE – LANGUAGE-BASED IMAGES (ES / EN)
     - Uses VITE_IMG_PATH
     - Preloads images in memory
     - Prevents layout flicker on language change
  ====================================================== */

  const IMG_PATH = import.meta.env.VITE_IMG_PATH || "/build/img/";
  const preloadedImages = { es: {}, en: {} };
  const mediaItems = document.querySelectorAll(".guide-content__media");

  /**
   * Preloads both .webp and .png versions
   * for all supported languages.
   */
  function preloadImages() {  
    ["es", "en"].forEach(lang => {
      mediaItems.forEach(picture => {
        const baseName = picture.dataset.img;
        if (!baseName) return;

        const webp = new Image();
        webp.src = `${IMG_PATH}${baseName}-${lang}.webp`;
        preloadedImages[lang][`${baseName}-webp`] = webp;

        const png = new Image();
        png.src = `${IMG_PATH}${baseName}-${lang}.png`;
        preloadedImages[lang][`${baseName}-png`] = png;
      });
    });
  }

  /**
   * Updates guide images dynamically
   * based on active i18n language.
   */
  function updateGuideImages() {
    const lang = getLang();

    mediaItems.forEach(picture => {
      const baseName = picture.dataset.img;
      if (!baseName) return;

      const source = picture.querySelector("source");
      const img = picture.querySelector("img");

      if (source && preloadedImages[lang][`${baseName}-webp`]) {
        source.srcset = preloadedImages[lang][`${baseName}-webp`].src;
      }

      if (img && preloadedImages[lang][`${baseName}-png`]) {
        img.src = preloadedImages[lang][`${baseName}-png`].src;
      }
    });
  }

  preloadImages();
  updateGuideImages();

  /* ======================================================
     🔘 CREATE / SEARCH BUTTON CONTROL
     - Locked by default
     - Enabled via cache (fast UX)
     - Confirmed via Firebase (authoritative)
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
     ⚡ AUTH CACHE (INSTANT FEEDBACK)
  ====================================================== */

  const cachedState = getCachedAuthState();

  if (["guest", "verified", "user"].includes(cachedState)) {
    isAllowed = true;
    createBtn.classList.remove("btn--locked");
    searchBtn.classList.remove("btn--locked");
  }

  /* ======================================================
     🔐 FIREBASE AUTH (REAL VALIDATION)
  ====================================================== */

  const authState = await onAuthReady();
  if (!authState) return;

  isAllowed = ["guest", "verified", "user"].includes(authState.role);
  if (!isAllowed) return;

  createBtn.classList.remove("btn--locked");
  searchBtn.classList.remove("btn--locked");

  /* ======================================================
     🧭 GUIDE STEP NAVIGATION (BEM SAFE)
     - Circular navigation
     - Uses modifier: guide-content__step--active
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
     🔍 IMAGE ZOOM OVERLAY
     - Dynamically injected
     - Uses currentSrc for correct resolution
     - Clears src on close (memory safety)
  ====================================================== */

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
     💡 GUEST → VERIFIED MIGRATION SYSTEM
     - Prevents duplicate migrations
     - Checks Firestore flag
     - Marks as migrated if notes already exist
     - Executes migration only if necessary
  ====================================================== */

  if (authState.role === "verified") {

    const userRef = doc(db, "users", authState.user.uid);
    const userSnap = await getDoc(userRef);

    const alreadyMigrated =
      userSnap.exists() &&
      userSnap.data().guestMigrationDone === true;

    if (alreadyMigrated) return;

    const existingNotesSnap = await getDocs(
      query(collection(db, "notes"), where("uid", "==", authState.user.uid))
    );

    if (!existingNotesSnap.empty) {
      await setDoc(
        userRef,
        { guestMigrationDone: true },
        { merge: true }
      );
      return;
    }

    const guestNotes =
      JSON.parse(localStorage.getItem("guestNotes")) || [];

    if (guestNotes.length === 0) return;

    await window.runGuestMigration();
  }

  /* ======================================================
     🔥 NOTES COUNTER (VERIFIED USERS ONLY)
  ====================================================== */

  if (authState.role !== "verified") return;

  const q = query(
    collection(db, "notes"),
    where("uid", "==", authState.user.uid)
  );

  const snapshot = await getDocs(q);
  const notesCount = snapshot.size;

  /* ======================================================
     🌍 i18n BUTTON TEXT PROTECTION
     - Dynamically switches between empty/normal text
     - Re-applies translation safely
  ====================================================== */

  const textSpan = createBtn.querySelector(".btn-text");

  if (textSpan) {
    const key =
      notesCount === 0
        ? createBtn.dataset.emptyText
        : createBtn.dataset.normalText;

    if (key) {
      textSpan.dataset.i18n = key;
      applyTranslations(createBtn);
    }
  }

  /* ======================================================
     🔁 PUBLIC EXPOSURE FOR lang-auto.js
  ====================================================== */

  window.updateGuideImages = updateGuideImages;

})();
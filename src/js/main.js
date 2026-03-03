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
import { applyTranslations, getLang } from "./i18n/index.js";

(async function () {

  applyTranslations();

  /* ======================================================
     🌍 GUÍA – IMÁGENES POR IDIOMA (ES / EN) CON VITE_IMG_PATH Y PRECARGA EN MEMORIA
  ====================================================== */
  const IMG_PATH = import.meta.env.VITE_IMG_PATH || "/build/img/";
  const preloadedImages = { es: {}, en: {} };
  const mediaItems = document.querySelectorAll(".guide-content__media");

  function preloadImages() {  
    ["es", "en"].forEach(lang => {
      mediaItems.forEach(picture => {
        const baseName = picture.dataset.img;
        if (!baseName) return;

        // precargar webp
        const webp = new Image();
        webp.src = `${IMG_PATH}${baseName}-${lang}.webp`;
        preloadedImages[lang][`${baseName}-webp`] = webp;

        // precargar png
        const png = new Image();
        png.src = `${IMG_PATH}${baseName}-${lang}.png`;
        preloadedImages[lang][`${baseName}-png`] = png;
      });
    });
  }

  function updateGuideImages() {
    const lang = getLang(); // idioma real del sistema i18n
    

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
  updateGuideImages(); // 🔥 al cargar la página

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
    💡 MIGRACIÓN AUTOMÁTICA (CONTROL TOTAL INTELIGENTE)
  ====================================================== */
  if (authState.role === "verified") {

    const userRef = doc(db, "users", authState.user.uid);
    const userSnap = await getDoc(userRef);

    const alreadyMigrated =
      userSnap.exists() &&
      userSnap.data().guestMigrationDone === true;

    // 🚀 Si ya fue migrado oficialmente → no hacer nada
    if (alreadyMigrated) return;

    // 🔎 Revisar si ya tiene notas en Firestore
    const existingNotesSnap = await getDocs(
      query(collection(db, "notes"), where("uid", "==", authState.user.uid))
    );

    // 🚀 Si ya tiene notas en su cuenta → marcar como migrado y no preguntar más
    if (!existingNotesSnap.empty) {
      await setDoc(
        userRef,
        { guestMigrationDone: true },
        { merge: true }
      );
      return;
    }

    // 📦 Revisar notas guest
    const guestNotes =
      JSON.parse(localStorage.getItem("guestNotes")) || [];

    if (guestNotes.length === 0) {
      return;
    }

    // 🚀 Ejecutar migración
    await window.runGuestMigration();
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

  /* ======================================================
     🌍 i18n – PROTECCIÓN
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
     🔁 EXPONER PARA lang-auto.js
  ====================================================== */
  window.updateGuideImages = updateGuideImages;

})();
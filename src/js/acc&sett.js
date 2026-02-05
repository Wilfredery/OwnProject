/* ======================================================
   ACCOUNT & SETTINGS – AUTH (3 ESTADOS)
====================================================== */

import { onAuthReady, signOutUser } from "./auth.js";
import { getCachedAuthState } from "./authState.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "./auth.js";
import Swal from "sweetalert2";
import { t } from "./i18n/index.js";

/* ======================================================
   ELEMENTOS DOM
====================================================== */

const userNameEl = document.querySelector(".settings__user--userName");
const logoutBtn = document.getElementById("logout-btn");
const changePassBtn = document.getElementById("change-password-btn");
const migrateBtn = document.getElementById("migrate-notes-btn");

/* ======================================================
   ESTADO INICIAL
====================================================== */

userNameEl && (userNameEl.textContent = "...");
logoutBtn && (logoutBtn.disabled = true);
changePassBtn && (changePassBtn.disabled = true);
migrateBtn && (migrateBtn.disabled = true);

/* ======================================================
   ⚡ UX INMEDIATA (CACHE)
====================================================== */

const cachedState = getCachedAuthState();

if (cachedState === "verified") {
  logoutBtn.disabled = false;
  changePassBtn.disabled = false;
  migrateBtn.disabled = false;
}

if (cachedState === "unverified" || cachedState === "guest") {
  logoutBtn.disabled = false;
}

/* ======================================================
   🔐 CONFIRMACIÓN REAL (FIREBASE)
====================================================== */

(async function () {
  if (!userNameEl) return;

  const authState = await onAuthReady();
  logoutBtn.disabled = false;

  if (!authState || authState.role === "guest") {
    userNameEl.textContent = t("guest");
    changePassBtn.disabled = true;
    migrateBtn.disabled = true;
    return;
  }

  if (authState.role === "unverified") {
    userNameEl.textContent = t("UserNotVerfied");
    changePassBtn.disabled = true;
    migrateBtn.disabled = true;
    return;
  }

  const user = authState.user;
  userNameEl.textContent = user.displayName || user.email;

  const isEmailProvider = user.providerData.some(
    p => p.providerId === "password"
  );

  changePassBtn.disabled = !isEmailProvider;
  migrateBtn.disabled = false;
})();

/* ======================================================
   LOGOUT
====================================================== */

logoutBtn?.addEventListener("click", async () => {
  if (logoutBtn.disabled) return;

  const result = await Swal.fire({
    title: t("tittleCloseSession"),
    text: t("textCloseSession"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("confirmCloseSession"),
    cancelButtonText: t("cancerlCloseSession"),
    customClass: { popup: "minimal-alert" }
  });

  if (result.isConfirmed) {
    await signOutUser();
    window.location.href = "/";
  }
});

/* ======================================================
   CAMBIAR CONTRASEÑA
====================================================== */

changePassBtn?.addEventListener("click", () => {
  if (changePassBtn.disabled) return;
  window.location.href = "/olvidar";
});

/* ======================================================
   🧠 MIGRAR NOTAS GUEST → USUARIO
   🔒 FLAG EN FIRESTORE
====================================================== */

migrateBtn?.addEventListener("click", async () => {
  if (migrateBtn.disabled) return;

  const authState = await onAuthReady();
  if (!authState || authState.role !== "verified") return;

  const user = authState.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  /* ======================
     📦 YA MIGRADO (FIRESTORE)
  ====================== */
  if (userSnap.exists() && userSnap.data().guestMigrationDone) {
    return Swal.fire({
      icon: "info",
      title: t("alreadyMigrated"),
      customClass: { popup: "minimal-alert" }
    });
  }

  const guestNotes =
    JSON.parse(localStorage.getItem("guestNotes")) || [];

  /* ======================
     🚫 SIN NOTAS
  ====================== */
  if (guestNotes.length === 0) {
    return Swal.fire({
      icon: "info",
      title: t("noNotesToMigrate"),
      customClass: { popup: "minimal-alert" }
    });
  }

  const confirm = await Swal.fire({
    title: t("migrateNotesTitle"),
    text: t("migrateNotesText"),
    icon: "question",
    showCancelButton: true,
    confirmButtonText: t("confirmMigrate"),
    cancelButtonText: t("cancelMigrate"),
    customClass: { popup: "minimal-alert" }
  });

  if (!confirm.isConfirmed) return;

  /* ======================
     NOTAS EXISTENTES USER
  ====================== */
  const snap = await getDocs(
    query(collection(db, "notes"), where("uid", "==", user.uid))
  );

  const usedTitles = new Map();

  snap.forEach(d => {
    usedTitles.set(d.data().title.toLowerCase(), d.id);
  });

  /* ======================
     MIGRACIÓN
  ====================== */
  for (const note of guestNotes) {
    const baseTitle = note.title;
    const normalized = baseTitle.toLowerCase();
    let finalTitle = baseTitle;

    if (usedTitles.has(normalized)) {
      const decision = await Swal.fire({
        title: t("duplicateTitle"),
        text: `"${baseTitle}"`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("overwrite"),
        cancelButtonText: t("duplicate"),
        customClass: { popup: "minimal-alert" }
      });

      if (decision.isConfirmed) {
        await deleteDoc(doc(db, "notes", usedTitles.get(normalized)));
      } else {
        finalTitle = `${baseTitle} (copy)`;
      }
    }

    await addDoc(collection(db, "notes"), {
      uid: user.uid,
      title: finalTitle,
      content: note.content,
      created_at: new Date()
    });

    usedTitles.set(finalTitle.toLowerCase(), true);
  }

  /* ======================
     🔐 FLAG DEFINITIVO
  ====================== */
  await setDoc(
    userRef,
    { guestMigrationDone: true },
    { merge: true }
  );

  /* ======================
     🧹 LIMPIEZA LOCAL
  ====================== */
  localStorage.removeItem("guestNotes");
  localStorage.removeItem("migratedGuestNoteIds");

  Swal.fire({
    icon: "success",
    title: t("migrationComplete"),
    customClass: { popup: "minimal-alert" }
  });
});

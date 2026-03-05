/**
 * ============================================================
 *  ACCOUNT & SETTINGS – AUTH MANAGEMENT (3 STATES)
 * ============================================================
 *
 * This module handles:
 * - Authentication state validation
 * - UI behavior based on user role
 * - Logout functionality
 * - Password change redirect
 * - Guest-to-user notes migration
 *
 * User roles handled:
 * - guest
 * - unverified
 * - verified
 *
 * Integrations:
 * - Firebase Authentication
 * - Firestore Database
 * - SweetAlert2 (UX dialogs)
 * - i18n translation system
 *
 * ============================================================
 */

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

/* ============================================================
   DOM ELEMENTS
============================================================ */

const userNameEl = document.querySelector(".settings__user--userName");
const logoutBtn = document.getElementById("logout-btn");
const changePassBtn = document.getElementById("change-password-btn");
const migrateBtn = document.getElementById("migrate-notes-btn");

/* ============================================================
   INITIAL UI STATE
============================================================ */

/**
 * Set safe default UI state before authentication resolves.
 */
userNameEl && (userNameEl.textContent = "...");
logoutBtn && (logoutBtn.disabled = true);
changePassBtn && (changePassBtn.disabled = true);
migrateBtn && (migrateBtn.disabled = true);

/* ============================================================
   ⚡ IMMEDIATE UX USING CACHED AUTH STATE
============================================================ */

/**
 * Uses cached authentication state to avoid UI flicker
 * while Firebase resolves the real authentication state.
 */
const cachedState = getCachedAuthState();

if (cachedState === "verified" || cachedState === "user") {
  logoutBtn.disabled = false;
  changePassBtn.disabled = false;
  migrateBtn.disabled = false;
}

if (cachedState === "unverified" || cachedState === "guest") {
  logoutBtn.disabled = false;
}

/* ============================================================
   🔐 REAL AUTH CONFIRMATION (FIREBASE)
============================================================ */

(async function () {
  if (!userNameEl) return;

  const authState = await onAuthReady();
  logoutBtn.disabled = false;

  /**
   * Guest user
   */
  if (!authState || authState.role === "guest") {
    userNameEl.textContent = t("guest");
    changePassBtn.disabled = true;
    migrateBtn.disabled = true;
    return;
  }

  /**
   * Email not verified
   */
  if (authState.role === "unverified") {
    userNameEl.textContent = t("UserNotVerfied");
    changePassBtn.disabled = true;
    migrateBtn.disabled = true;
    return;
  }

  const user = authState.user;

  /**
   * Retrieve additional user data from Firestore
   */
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().nickname) {
    userNameEl.textContent = userSnap.data().nickname;
  } else {
    userNameEl.textContent = user.displayName || user.email;
  }

  /**
   * Enable password change only for email/password users
   */
  const isEmailProvider = user.providerData.some(
    p => p.providerId === "password"
  );

  changePassBtn.disabled = !isEmailProvider;
  migrateBtn.disabled = false;
})();

/* ============================================================
   LOGOUT HANDLER
============================================================ */

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
    window.location.href = "/login";
  }
});

/* ============================================================
   PASSWORD CHANGE REDIRECT
============================================================ */

changePassBtn?.addEventListener("click", () => {
  if (changePassBtn.disabled) return;
  window.location.href = "/olvidar";
});

/* ============================================================
   🧠 GUEST NOTES MIGRATION
============================================================ */

/**
 * Prevents multiple migrations during same session.
 */
window.__guestMigrationDoneInSession = false;

/**
 * Migrates notes stored in localStorage (guest mode)
 * into Firestore once user becomes verified.
 *
 * Handles:
 * - Duplicate title detection
 * - Overwrite / Duplicate / Cancel decision
 * - Firestore write operations
 * - Post-migration cleanup
 */
window.runGuestMigration = async function () {

  const authState = await onAuthReady();
  if (!authState || authState.role !== "verified") return;

  const user = authState.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  /**
   * Prevent re-migration if already completed.
   */
  if (userSnap.exists() && userSnap.data().guestMigrationDone) {
    window.__guestMigrationDoneInSession = true;
    return Swal.fire({
      icon: "info",
      title: t("alreadyMigrated"),
      customClass: { popup: "minimal-alert" }
    });
  }

  const guestNotes =
    JSON.parse(localStorage.getItem("guestNotes")) || [];

  if (guestNotes.length === 0) {
    window.__guestMigrationDoneInSession = true;
    return Swal.fire({
      icon: "info",
      title: t("noNotesToMigrate"),
      customClass: { popup: "minimal-alert" }
    });
  }

  /**
   * Confirm migration with user
   */
  const confirm = await Swal.fire({
    title: t("migrateNotesTitle"),
    text: t("migrateNotesText"),
    icon: "question",
    showCancelButton: true,
    confirmButtonText: t("confirmMigrate"),
    cancelButtonText: t("cancelMigrate"),
    customClass: { popup: "minimal-alert" }
  });

  if (!confirm.isConfirmed) {
    window.__guestMigrationDoneInSession = true;
    return;
  }

  /**
   * Retrieve existing notes for duplicate detection
   */
  const snap = await getDocs(
    query(collection(db, "notes"), where("uid", "==", user.uid))
  );

  const usedTitles = new Map();
  snap.forEach(d => {
    usedTitles.set(d.data().title.toLowerCase(), d.id);
  });

  /**
   * Process each guest note
   */
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
        showDenyButton: true,
        confirmButtonText: t("overwrite"),
        denyButtonText: t("duplicate"),
        cancelButtonText: t("duplicateCancel"),
        customClass: { popup: "minimal-alert" }
      });

      if (decision.isConfirmed) {
        const existingId = usedTitles.get(normalized);
        if (existingId) {
          await deleteDoc(doc(db, "notes", existingId));
        }
      } else {
        finalTitle = `${baseTitle} (copy)`;
      }
    }

    const newDoc = await addDoc(collection(db, "notes"), {
      uid: user.uid,
      title: finalTitle,
      content: note.content,
      created_at: new Date()
    });

    usedTitles.set(finalTitle.toLowerCase(), newDoc.id);
  }

  /**
   * Mark migration as completed
   */
  await setDoc(
    userRef,
    { guestMigrationDone: true },
    { merge: true }
  );

  localStorage.removeItem("guestNotes");
  localStorage.removeItem("migratedGuestNoteIds");

  window.__guestMigrationDoneInSession = true;

  await Swal.fire({
    icon: "success",
    title: t("migrationComplete"),
    customClass: { popup: "minimal-alert" }
  });

  return;
};

migrateBtn?.addEventListener("click", window.runGuestMigration);
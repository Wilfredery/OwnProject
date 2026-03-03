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

if (cachedState === "verified" || cachedState === "user") {
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

  // 🔥 AQUÍ ESTÁ EL CAMBIO IMPORTANTE
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().nickname) {
    userNameEl.textContent = userSnap.data().nickname;
  } else {
    userNameEl.textContent = user.displayName || user.email;
  }

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
    window.location.href = "/login";
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
   🧠 FUNCIÓN CENTRAL DE MIGRACIÓN
====================================================== */

window.__guestMigrationDoneInSession = false;

window.runGuestMigration = async function () {
  const authState = await onAuthReady();
  if (!authState || authState.role !== "verified") return;

  const user = authState.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

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

  const snap = await getDocs(
    query(collection(db, "notes"), where("uid", "==", user.uid))
  );

  const usedTitles = new Map();
  snap.forEach(d => {
    usedTitles.set(d.data().title.toLowerCase(), d.id);
  });

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
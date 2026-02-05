// src/js/auth.js
import {
  auth,
  provider,
  db,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification,
  confirmPasswordReset,
  applyActionCode,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "./firebase.js";

/* =========================
   GUEST LOCAL (NO AUTH)
========================= */
const GUEST_KEY = "guest_session";

export function initGuestSession() {
  if (!localStorage.getItem(GUEST_KEY)) {
    localStorage.setItem(GUEST_KEY, crypto.randomUUID());
  }
  return localStorage.getItem(GUEST_KEY);
}

export function clearGuestSession() {
  localStorage.removeItem(GUEST_KEY);
}

export function getGuestSession() {
  return localStorage.getItem(GUEST_KEY);
}

/* =========================
   USER DOCUMENT
========================= */
export async function createOrUpdateUserDoc(user, extra = {}) {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const baseData = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || "User",
    photoURL: user.photoURL || null,
    isAnonymous: user.isAnonymous || false,
    lastSeen: serverTimestamp(),
    ...extra,
  };

  if (snap.exists()) {
    await setDoc(ref, {
      displayName: baseData.displayName,
      photoURL: baseData.photoURL,
      email: baseData.email
    }, { merge: true });
  } else {
    await setDoc(ref, {
      ...baseData,
      createdAt: serverTimestamp(),
      guestMigrationDone: false
    });
  }

}

/* =========================
   AUTH READY (3 ESTADOS REAL)
========================= */
export function onAuthReady() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();

      /* 👤 GUEST */
      if (!user) {
        const guestId = initGuestSession();
        return resolve({
          role: "guest",
          guestId,
          user: null,
        });
      }

      /* 🔁 ESTADO REAL */
      await user.reload();

      const isGoogle = user.providerData.some(
        p => p.providerId === "google.com"
      );

      await createOrUpdateUserDoc(user);

      return resolve({
        role: isGoogle || user.emailVerified
          ? "verified"
          : "unverified",
        user,
      });
    });
  });
}

/* =========================
   AUTH ACTIONS
========================= */

// 📧 Registro con email
export async function signUpWithEmail(email, password, nickname) {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // 🔐 enviar verificación SOLO una vez
  await sendEmailVerification(res.user);

  await createOrUpdateUserDoc(res.user, {
    nickname,
    provider: "password",
    emailVerificationSent: true,
  });

  clearGuestSession();
  return res.user;
}

// 🔐 Login con email (NO BLOQUEA)
export async function signInWithEmail(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);

  await res.user.reload();

  await createOrUpdateUserDoc(res.user);
  clearGuestSession();

  return {
    user: res.user,
    isVerified: res.user.emailVerified,
  };
}

// 🔵 Login con Google (verificado automático)
export async function signInWithGoogle() {
  const res = await signInWithPopup(auth, provider);

  await createOrUpdateUserDoc(res.user);
  clearGuestSession();

  return {
    user: res.user,
    isVerified: true,
  };
}

// 🚪 Logout
export async function signOutUser() {
  await signOut(auth);
  initGuestSession();
}

// 🔁 Password reset
export async function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function resetPassword(oobCode, newPassword) {
  return confirmPasswordReset(auth, oobCode, newPassword);
}

// ✅ Confirmar email
export async function confirmEmailWithCode(oobCode) {
  await applyActionCode(auth, oobCode);

  if (auth.currentUser) {
    await auth.currentUser.reload();
  }
}

/* =========================
   EXPORTS EXTRA
========================= */
export {
  db,
  serverTimestamp
};

/**
 * ============================================================
 *  AUTHENTICATION CORE MODULE
 * ============================================================
 *
 * Central authentication controller.
 *
 * Responsibilities:
 * - Guest session handling (local-only)
 * - Firebase authentication lifecycle
 * - Firestore user document management
 * - Role resolution (guest / unverified / verified)
 * - Auth actions (login, register, logout, reset, verify)
 *
 * Architecture:
 * - Firebase Authentication
 * - Firestore (users collection)
 * - LocalStorage guest session fallback
 *
 * Roles:
 * - guest        → No Firebase user
 * - unverified   → Email/password user without verification
 * - verified     → Google user OR verified email user
 *
 * ============================================================
 */

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

/* ============================================================
   GUEST SESSION (LOCAL ONLY – NO FIREBASE)
============================================================ */

const GUEST_KEY = "guest_session";

/**
 * Initializes a guest session using a random UUID.
 * Ensures a consistent local identifier for non-auth users.
 */
export function initGuestSession() {
  if (!localStorage.getItem(GUEST_KEY)) {
    localStorage.setItem(GUEST_KEY, crypto.randomUUID());
  }
  return localStorage.getItem(GUEST_KEY);
}

/**
 * Clears current guest session.
 */
export function clearGuestSession() {
  localStorage.removeItem(GUEST_KEY);
}

/**
 * Returns current guest session ID.
 */
export function getGuestSession() {
  return localStorage.getItem(GUEST_KEY);
}

/* ============================================================
   USER DOCUMENT MANAGEMENT (FIRESTORE)
============================================================ */

/**
 * Creates or updates the Firestore user document.
 *
 * Behavior:
 * - If document exists → update selected fields
 * - If document does not exist → create new record
 *
 * @param {Object} user - Firebase user object
 * @param {Object} extra - Additional fields to merge
 */
export async function createOrUpdateUserDoc(user, extra = {}) {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const baseData = {
    uid: user.uid,
    email: extra.email || user.email || null,
    displayName: user.displayName || "User",
    photoURL: user.photoURL || null,
    isAnonymous: user.isAnonymous || false,
    lastSeen: serverTimestamp(),
    ...extra,
  };

  if (snap.exists()) {

    /**
     * Update existing document
     * lastSeen is always refreshed
     */
    await setDoc(
      ref,
      {
        displayName: baseData.displayName,
        photoURL: baseData.photoURL,
        email: baseData.email,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

  } else {

    /**
     * Create new user document
     */
    await setDoc(ref, {
      ...baseData,
      createdAt: serverTimestamp(),
      guestMigrationDone: false,
    });
  }
}

/* ============================================================
   AUTH READY (REAL 3-STATE RESOLUTION)
============================================================ */

/**
 * Resolves authentication state once.
 *
 * Returns:
 * - { role: "guest", guestId, user: null }
 * - { role: "unverified", user }
 * - { role: "verified", user }
 *
 * Ensures:
 * - Firestore user document is synced
 */
export function onAuthReady() {
  return new Promise((resolve) => {

    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();

      /* 👤 Guest */
      if (!user) {
        const guestId = initGuestSession();
        return resolve({
          role: "guest",
          guestId,
          user: null,
        });
      }

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

/* ============================================================
   AUTH ACTIONS
============================================================ */

/* 📧 Email Registration */
export async function signUpWithEmail(email, password, nickname) {

  const res = await createUserWithEmailAndPassword(auth, email, password);

  // Send email verification
  await sendEmailVerification(res.user);

  await createOrUpdateUserDoc(res.user, {
    nickname,
    email,
    provider: "password",
    emailVerificationSent: true,
  });

  clearGuestSession();
  return res.user;
}

/* 🔐 Email Login */
export async function signInWithEmail(email, password) {

  const res = await signInWithEmailAndPassword(auth, email, password);

  // Force refresh user state
  await res.user.reload();

  await createOrUpdateUserDoc(res.user);
  clearGuestSession();

  return {
    user: res.user,
    isVerified: res.user.emailVerified,
  };
}

/* 🔵 Google Login */
export async function signInWithGoogle() {

  const res = await signInWithPopup(auth, provider);

  // Force full refresh
  await res.user.reload();

  return res;
}

/* 🚪 Logout */
export async function signOutUser() {
  await signOut(auth);
  initGuestSession();
}

/* 🔁 Password Reset (request email) */
export async function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

/* 🔄 Confirm Password Reset */
export async function resetPassword(oobCode, newPassword) {
  return confirmPasswordReset(auth, oobCode, newPassword);
}

/* ✅ Confirm Email with Action Code */
export async function confirmEmailWithCode(oobCode) {

  await applyActionCode(auth, oobCode);

  if (auth.currentUser) {
    await auth.currentUser.reload();
  }
}

/* ============================================================
   EXTRA EXPORTS
============================================================ */

export {
  db,
  serverTimestamp
};
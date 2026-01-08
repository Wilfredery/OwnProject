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
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "./firebase.js";

/* =========================
   USER DOCUMENT
========================= */
export async function createOrUpdateUserDoc(user) {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const data = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    lastSeen: serverTimestamp(),
  };

  if (snap.exists()) {
    await setDoc(ref, data, { merge: true });
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  }
}

/* =========================
   AUTH LISTENER (GLOBAL)
========================= */
export function initAuthListener({ onSignedIn, onSignedOut } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await createOrUpdateUserDoc(user);
      onSignedIn?.(user);
    } else {
      onSignedOut?.();
    }
  });
}

/* =========================
   GET CURRENT USER (PROMISE)
========================= */
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

/* =========================
   AUTH READY (ALIAS 🔥)
========================= */
export function onAuthReady() {
  return getCurrentUser();
}

/* =========================
   AUTH ACTIONS
========================= */
export async function signUpWithEmail(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(res.user);
  await createOrUpdateUserDoc(res.user);
  return res.user;
}

export async function signInWithEmail(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  await createOrUpdateUserDoc(res.user);
  return res.user;
}

export async function signInWithGoogle() {
  const res = await signInWithPopup(auth, provider);
  await createOrUpdateUserDoc(res.user);
  return res.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}

/* =========================
   FIRESTORE EXPORTS
========================= */
export {
  db,
  serverTimestamp,
};

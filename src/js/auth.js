// auth.js
import {
  auth, provider, db,
  signInWithPopup, signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification,
  doc, setDoc, getDoc, serverTimestamp
} from "./firebase.js";

/**
 * Crea/actualiza el documento de usuario en Firestore
 */
export async function createOrUpdateUserDoc(user) {
  if (!user || !user.uid) return;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const payload = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    lastSeen: serverTimestamp(),
  };
  if (snap.exists()) {
    await setDoc(userRef, payload, { merge: true });
  } else {
    await setDoc(userRef, { ...payload, createdAt: serverTimestamp() });
  }
}

/** Inicia listener global de auth; recibe callbacks opcionales */
export function initAuthListener({ onSignedIn, onSignedOut } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // actualiza/crea doc en firestore
      await createOrUpdateUserDoc(user);
      if (onSignedIn) onSignedIn(user);
    } else {
      if (onSignedOut) onSignedOut();
    }
  });
}

/** Forzar ruta solo para usuarios autenticados (en el cliente) */
export function requireAuth(redirectTo = "/") {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else {
        window.location.href = redirectTo;
        reject(new Error("No autenticado"));
      }
    });
  });
}

/** Inicios de sesión / registro */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  // result.user contiene info del usuario
  await createOrUpdateUserDoc(result.user);
  return result.user;
}

export async function signUpWithEmail(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // enviar verificación por email (opcional)
  await sendEmailVerification(result.user);
  await createOrUpdateUserDoc(result.user);
  return result.user;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await createOrUpdateUserDoc(result.user);
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

/** Reset de contraseña */
export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}

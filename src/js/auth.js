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
  signInAnonymously,
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
    displayName: user.displayName || "Guest",
    photoURL: user.photoURL || null,
    isAnonymous: user.isAnonymous,
    lastSeen: serverTimestamp(),
  };

  if (snap.exists()) {
    await setDoc(ref, data, { merge: true });
  } else {
    await setDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
    });
  }
}

/* =========================
   AUTH READY (SIEMPRE UID)
========================= */
export function onAuthReady() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub(); // 🔥 evita dobles ejecuciones

      // 1️⃣ Si no hay usuario → anónimo
      if (!user) {
        const res = await signInAnonymously(auth);
        await createOrUpdateUserDoc(res.user);
        return resolve(res.user);
      }

      // 2️⃣ Si es email/password y NO ha verificado correo
      const providerId = user.providerData[0]?.providerId;

      if (providerId === "password" && !user.emailVerified) {
        await signOut(auth);
        return resolve(null); // ⛔ bloqueado hasta verificar
      }

      // 3️⃣ Usuario válido
      await createOrUpdateUserDoc(user);
      resolve(user);
    });
  });
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

export async function resetPassword(oobCode, newPassword) {
  return confirmPasswordReset(auth, oobCode, newPassword);
}

export async function confirmEmailWithCode(oobCode) {
  return applyActionCode(auth, oobCode);
}

export async function sendResetPassword(email) {
  const actionCodeSettings = {
    url: `${window.location.origin}/password`,
    handleCodeInApp: true,
  };

  return sendPasswordResetEmail(auth, email, actionCodeSettings);
}

export {
  db,
  serverTimestamp
};

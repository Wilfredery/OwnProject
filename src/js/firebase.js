// src/js/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously, // ✅ CLAVE
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification,
  confirmPasswordReset,   // ✅
  applyActionCode         // ✅
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBi1_Q6gYgIbln6G14ogzPXeo0ZDhG3kBM",
  authDomain: "mynotes-c7209.firebaseapp.com",
  projectId: "mynotes-c7209",
  storageBucket: "mynotes-c7209.firebasestorage.app",
  messagingSenderId: "1053521212100",
  appId: "1:1053521212100:web:a8d436f5c6058e7765cf91"
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 Firestore
const db = getFirestore(app);

export {
  app,
  auth,
  provider,
  db,

  // Auth
  signInWithPopup,
  signOut,
  signInAnonymously, // ✅ EXPORTADO
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  confirmPasswordReset,   // ✅
  applyActionCode,        // ✅

  // Firestore
  doc,
  setDoc,
  getDoc,
  serverTimestamp
};

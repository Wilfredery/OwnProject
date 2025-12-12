// src/js/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

// 🔥 Tu configuración (sin cambios)
const firebaseConfig = {
  apiKey: "AIzaSyBi1_Q6gYgIbln6G14ogzPXeo0ZDhG3kBM",
  authDomain: "mynotes-c7209.firebaseapp.com",
  projectId: "mynotes-c7209",
  storageBucket: "mynotes-c7209.firebasestorage.app",
  messagingSenderId: "1053521212100",
  appId: "1:1053521212100:web:a8d436f5c6058e7765cf91"
};

// 🔥 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 Firestore
const db = getFirestore(app);

// 📤 Exportar todo lo que necesitas en auth.js
export {
  app,
  auth,
  provider,
  db,
  // Métodos de Auth
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  // Firestore helpers
  doc,
  setDoc,
  getDoc,
  serverTimestamp
};

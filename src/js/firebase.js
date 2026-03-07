/**
 * ============================================================
 *  FIREBASE INITIALIZATION MODULE
 * ============================================================
 *
 * Centralized Firebase configuration and service exports.
 *
 * Responsibilities:
 * - Initialize Firebase app
 * - Configure Authentication (Email, Google, Anonymous)
 * - Initialize Firestore
 * - Export reusable Firebase utilities
 *
 * Environment Variables:
 * - FIREBASE_API_KEY
 * - FIREBASE_AUTH_DOMAIN
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_STORAGE_BUCKET
 * - FIREBASE_MESSAGING_SENDER_ID
 * - FIREBASE_APP_ID
 *
 * NOTE:
 * All credentials are injected via environment variables
 * and bundled at build time.
 *
 * ============================================================
 */

import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  checkActionCode
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

/* ============================================================
   FIREBASE CONFIGURATION
============================================================ */

/**
 * Firebase project configuration.
 * Values are provided via environment variables.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

/* ============================================================
   INITIALIZE APP
============================================================ */

const app = initializeApp(firebaseConfig);

/* ============================================================
   AUTHENTICATION SETUP
============================================================ */

/**
 * Firebase Authentication instance
 */
const auth = getAuth(app);

/**
 * Google OAuth provider configuration
 * - Requests email & profile scopes
 * - Forces account selection on login
 */
const provider = new GoogleAuthProvider();

provider.addScope("email");
provider.addScope("profile");

provider.setCustomParameters({
  prompt: "select_account"
});

/* ============================================================
   FIRESTORE SETUP
============================================================ */

/**
 * Firestore database instance
 */
const db = getFirestore(app);

/* ============================================================
   EXPORTS
============================================================ */

export {
  app,
  auth,
  provider,
  db,

  /* --------------------
     AUTH METHODS
  -------------------- */
  signInWithPopup,
  signOut,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  checkActionCode,

  /* --------------------
     FIRESTORE METHODS
  -------------------- */
  doc,
  setDoc,
  getDoc,
  serverTimestamp
};
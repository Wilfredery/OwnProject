// src/js/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Rellena con tu configuración (la copias del panel de Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBi1_Q6gYgIbln6G14ogzPXeo0ZDhG3kBM",
  authDomain: "mynotes-c7209.firebaseapp.com",
  projectId: "mynotes-c7209",
  storageBucket: "mynotes-c7209.firebasestorage.app",
  messagingSenderId: "1053521212100",
  appId: "1:1053521212100:web:a8d436f5c6058e7765cf91"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

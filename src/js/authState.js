// src/js/authState.js
import { onAuthReady } from "./auth.js";

const CACHE_KEY = "auth_status";

/* =========================
   LEER CACHE
========================= */
export function getCachedAuthState() {
  return sessionStorage.getItem(CACHE_KEY);
}

/* =========================
   LIMPIAR CACHE (logout)
========================= */
export function clearAuthCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

/* =========================
   ESTADO REAL (Firebase)
========================= */
export async function resolveAuthState() {
  const authState = await onAuthReady();

  if (!authState || authState.role === "guest") {
    sessionStorage.setItem(CACHE_KEY, "guest");
    return { role: "guest" };
  }

  const user = authState.user;

  // 🔑 CLAVE
  await user.reload();

  if (user.emailVerified) {
    sessionStorage.setItem(CACHE_KEY, "verified");
    return { role: "user", verified: true, user };
  }

  sessionStorage.setItem(CACHE_KEY, "unverified");
  return { role: "user", verified: false, user };
}

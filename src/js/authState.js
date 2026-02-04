// src/js/authState.js
import { onAuthReady } from "./auth.js";

const CACHE_KEY = "auth_status";

/* =========================
   LEER CACHE (FAST PATH)
========================= */
export function getCachedAuthState() {
  return sessionStorage.getItem(CACHE_KEY);
}

/* =========================
   LIMPIAR CACHE
========================= */
export function clearAuthCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

/* =========================
   RESOLVER ESTADO REAL
========================= */
export async function resolveAuthState() {

  // 🔥 FAST PATH
  const cached = getCachedAuthState();
  if (cached) {
    return { role: cached };
  }

  // 🔐 SLOW PATH (solo si no hay cache)
  const authState = await onAuthReady();

  sessionStorage.setItem(CACHE_KEY, authState.role);
  return authState;
}

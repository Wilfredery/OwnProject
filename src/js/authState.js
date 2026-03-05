/**
 * ============================================================
 *  AUTH STATE CACHE LAYER
 * ============================================================
 *
 * Lightweight session-based caching layer
 * for authentication state resolution.
 *
 * Purpose:
 * - Avoid unnecessary Firebase calls
 * - Improve perceived performance
 * - Provide a "fast path" for UI decisions
 *
 * Storage:
 * - sessionStorage (per tab session)
 *
 * Works together with:
 * - auth.js (real Firebase resolution)
 *
 * ============================================================
 */

import { onAuthReady } from "./auth.js";

const CACHE_KEY = "auth_status";

/* ============================================================
   READ CACHE (FAST PATH)
============================================================ */

/**
 * Returns cached authentication role
 * from sessionStorage if available.
 *
 * @returns {string|null}
 */
export function getCachedAuthState() {
  return sessionStorage.getItem(CACHE_KEY);
}

/* ============================================================
   CLEAR CACHE
============================================================ */

/**
 * Removes cached authentication state.
 */
export function clearAuthCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

/* ============================================================
   RESOLVE AUTH STATE (FAST + SLOW PATH)
============================================================ */

/**
 * Resolves authentication state using:
 *
 * 1. Fast Path → session cache
 * 2. Slow Path → Firebase (onAuthReady)
 *
 * Returns:
 * - Cached role (if available)
 * - Real auth state from Firebase
 *
 * @returns {Object}
 */
export async function resolveAuthState() {

  // ----------------------------------------------------------
  // ⚡ FAST PATH (Session Cache)
  // ----------------------------------------------------------
  const cached = getCachedAuthState();
  if (cached) {
    return {
      role: cached,
      fromCache: true
    };
  }

  // ----------------------------------------------------------
  // 🔐 SLOW PATH (Firebase Resolution)
  // ----------------------------------------------------------
  const authState = await onAuthReady();

  setCachedAuthState(authState.role);

  return {
    ...authState,
    fromCache: false
  };
}

/* ============================================================
   INTERNAL CACHE SETTER
============================================================ */

/**
 * Stores authentication role in sessionStorage.
 *
 * @param {string} role
 */
function setCachedAuthState(role) {
  sessionStorage.setItem(CACHE_KEY, role);
}
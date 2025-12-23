// src/js/auth-helpers.js
import { getAuth } from "firebase/auth";

/**
 * Obtiene el usuario actual.
 * Si no existe, redirige a login o lanza error según lo que necesites.
 */
export function requireAuth(redirect = true) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        if (redirect) {
            window.location.href = "/";
            return null;
        }
        throw new Error("Usuario no autenticado");
    }

    return user;
}

/**
 * Obtiene el UID actual sin duplicar código en cada archivo.
 */
export function getUidOrThrow() {
    const auth = getAuth();
    if (!auth.currentUser) {
        throw new Error("Usuario no autenticado");
    }
    return auth.currentUser.uid;
}

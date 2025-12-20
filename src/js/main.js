import { db } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";

(async function () {

  // 🔍 Buscar el botón
  const createBtn = document.querySelector('.create-btn');

  // 👉 Si el botón NO existe, salimos sin errores (igual que otros scripts tuyos)
  if (!createBtn) {
    // console.warn('⚠️ No hay .create-btn en esta página.');
    return;
  }

  // 🔥 Cantidad real de notas en Firestore
  async function getNotesCount() {
    try {
      const snapshot = await getDocs(collection(db, "notes"));
      return snapshot.size;
    } catch (err) {
      console.error("Error obteniendo notas:", err);
      return 0; // fallback seguro
    }
  }

  const notesCount = await getNotesCount();

  // 🔄 Actualizar texto según cantidad de notas
  createBtn.innerHTML =
    notesCount === 0
      ? `<span class="btn-icon">📝</span><span class="btn-text" data-i18n="create_noteFirst"></span>`
      : `<span class="btn-icon">➕</span><span class="btn-text" data-i18n="create_note"></span>`;
      applyTranslations(currentLangData);
})();

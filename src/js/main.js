import { db, onAuthReady } from "./auth.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { applyTranslations } from "./i18n/index.js";

(async function () {

  /* ==========================================================
     🔍 BOTÓN CREAR
  ========================================================== */
  const createBtn = document.querySelector(".create-btn");
  if (!createBtn) return;

  /* ==========================================================
     🔐 ESPERAR AUTH
  ========================================================== */
  const user = await onAuthReady();
  if (!user) return;

  /* ==========================================================
     🔥 CONTAR NOTAS DEL USUARIO
  ========================================================== */
  async function getNotesCount() {
    try {
      const q = query(
        collection(db, "notes"),
        where("uid", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (err) {
      console.error("Error obteniendo notas:", err);
      return 0;
    }
  }

  const notesCount = await getNotesCount();

  /* ==========================================================
     🟦 CAMBIAR SOLO LA KEY DE TRADUCCIÓN (SIN PARPADEO)
  ========================================================== */
  const textSpan = createBtn.querySelector(".btn-text");

  const key =
    notesCount === 0
      ? createBtn.dataset.emptyText
      : createBtn.dataset.normalText;

  textSpan.dataset.i18n = key;

  applyTranslations(createBtn);

})();

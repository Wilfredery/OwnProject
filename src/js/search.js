// src/js/search.js
import Swal from "sweetalert2";
import { db, onAuthReady } from "./auth.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { t } from "./i18n/index.js";

(async function () {

  document.addEventListener("DOMContentLoaded", async () => {

    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const paginationContainer = document.getElementById("pagination");
    const emptyState = document.getElementById("empty-state");

    // ⛔ No estamos en search.ejs
    if (
      !searchInput ||
      !resultsContainer ||
      !paginationContainer ||
      !emptyState
    ) return;

    /* ==========================================================
       🔐 AUTH (3 ESTADOS)
    ========================================================== */
    const authState = await onAuthReady();

    // 👤 GUEST → fuera
    if (authState.role === "guest") {
      window.location.href = "/";
      return;
    }

    // 🟡 NO VERIFICADO → aviso + fuera
    if (authState.role === "unverified") {
      await Swal.fire({
        icon: "info",
        title: t("titleplsverifyemail"),
        text: t("plsverifyemail"),
        confirmButtonText: t("confirmplsverifyemail"),
        customClass: { popup: "minimal-alert" }
      });

      window.location.href = "/main";
      return;
    }

    // 🟢 VERIFICADO
    const user = authState.user;

    /* ==========================================================
       🔥 CARGAR NOTAS
    ========================================================== */
    async function loadNotes() {
      const notes = [];

      const q = query(
        collection(db, "notes"),
        where("uid", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();

        notes.push({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          created_at: data.created_at
            ? data.created_at.toDate()
            : null
        });
      });

      return notes;
    }

    /* ==========================================================
       🗑️ ELIMINAR NOTA
    ========================================================== */
    async function deleteNoteFromFirestore(id) {
      try {
        await deleteDoc(doc(db, "notes", id));
        return true;
      } catch (error) {
        console.error("Error eliminando nota:", error);
        return false;
      }
    }

    let notes = await loadNotes();
    let currentNotes = [];
    let currentPage = 1;

    const ITEMS_PER_PAGE = 10;
    const userLocale = navigator.language || "es-ES";

    /* ==========================================================
       🔢 PAGINACIÓN
    ========================================================== */
    function renderPagination(totalItems) {
      paginationContainer.innerHTML = "";

      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (totalPages <= 1) return;

      const createBtn = (text, disabled, onClick) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.classList.add("search__pagination--page-btn");
        btn.disabled = disabled;
        btn.addEventListener("click", onClick);
        return btn;
      };

      paginationContainer.appendChild(
        createBtn("<<", currentPage === 1, () => {
          currentPage = 1;
          renderNotes(currentNotes);
        })
      );

      paginationContainer.appendChild(
        createBtn("<", currentPage === 1, () => {
          currentPage--;
          renderNotes(currentNotes);
        })
      );

      for (let i = 1; i <= totalPages; i++) {
        const btn = createBtn(i, false, () => {
          currentPage = i;
          renderNotes(currentNotes);
        });
        if (i === currentPage) btn.classList.add("active");
        paginationContainer.appendChild(btn);
      }

      paginationContainer.appendChild(
        createBtn(">", currentPage === totalPages, () => {
          currentPage++;
          renderNotes(currentNotes);
        })
      );

      paginationContainer.appendChild(
        createBtn(">>", currentPage === totalPages, () => {
          currentPage = totalPages;
          renderNotes(currentNotes);
        })
      );
    }

    /* ==========================================================
       🟦 RENDER NOTAS
    ========================================================== */
    function renderNotes(list) {
      resultsContainer.innerHTML = "";
      currentNotes = list;

      if (list.length === 0) {
        emptyState.style.display = "block";
        paginationContainer.innerHTML = "";
        return;
      }

      emptyState.style.display = "none";

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;

      list.slice(start, end).forEach(note => {
        const li = document.createElement("li");
        li.classList.add("note-item");

        li.innerHTML = `
          <div class="info">
            <h3>${note.title}</h3>
            <p>${note.content.substring(0, 60)}...</p>
            <p class="fecha">
              ${
                note.created_at
                  ? note.created_at.toLocaleDateString(userLocale) + " " +
                    note.created_at.toLocaleTimeString(userLocale, {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : ""
              }
            </p>
          </div>
          <div class="actions">
            <button class="edit-btn" data-id="${note.id}" data-i18n="editar"></button>
            <button class="delete-btn" data-id="${note.id}" data-i18n="eliminar"></button>
          </div>
        `;

        resultsContainer.appendChild(li);
      });

      renderPagination(list.length);
    }

    renderNotes(notes);

    /* ==========================================================
       🔍 SEARCH
    ========================================================== */
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      currentPage = 1;

      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
      );

      renderNotes(filtered);
    });

    /* ==========================================================
       ✏️ EDITAR / 🗑️ ELIMINAR
    ========================================================== */
    resultsContainer.addEventListener("click", async (e) => {

      if (e.target.classList.contains("edit-btn")) {
        const id = e.target.dataset.id;

        const result = await Swal.fire({
          title: t("askEditNote"),
          text: t("textAskEditNote"),
          icon: "question",
          showCancelButton: true,
          confirmButtonText: t("confirmEditNote"),
          cancelButtonText: t("cancelEditNote"),
          customClass: { popup: "minimal-alert" }
        });

        if (result.isConfirmed) {
          window.location.href = `/editar/${id}`;
        }
      }

      if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;

        const result = await Swal.fire({
          title: t("askDelete"),
          text: t("textAskDelete"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: t("confirmDelete"),
          cancelButtonText: t("cancelDelete"),
          customClass: { popup: "minimal-alert" }
        });

        if (!result.isConfirmed) return;

        const ok = await deleteNoteFromFirestore(id);
        if (!ok) return;

        notes = notes.filter(n => n.id !== id);
        renderNotes(notes);

        Swal.fire({
          title: t("alreadyDeleted"),
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" }
        });
      }
    });

  });

})();

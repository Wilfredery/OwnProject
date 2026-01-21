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

  /* ==========================================================
     🔥 CARGAR NOTAS DEL USUARIO ACTUAL
  ========================================================== */
  async function loadNotes() {
    const user = await onAuthReady();
    if (!user) return [];

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

  document.addEventListener("DOMContentLoaded", async () => {

    let notes = await loadNotes();
    let currentNotes = [];
    let currentPage = 1;

    const ITEMS_PER_PAGE = 10;
    const userLocale = navigator.language || "es-ES";

    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const paginationContainer = document.getElementById("pagination");
    const emptyState = document.getElementById("empty-state");

    if (
      !searchInput ||
      !resultsContainer ||
      !paginationContainer ||
      !emptyState
    ) return;

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
       🟦 RENDERIZAR NOTAS
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
      const paginatedNotes = list.slice(start, end);

      paginatedNotes.forEach(note => {
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

    // 🚀 Primer render
    renderNotes(notes);

    /* ==========================================================
       🔍 BÚSQUEDA
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
       🟦 FILTROS
    ========================================================== */
    function sortNotes(type) {
      let sorted = [...notes];

      switch (type) {
        case "date-desc":
          sorted.sort((a, b) => b.created_at - a.created_at);
          break;
        case "date-asc":
          sorted.sort((a, b) => a.created_at - b.created_at);
          break;
        case "alpha-asc":
          sorted.sort((a, b) =>
            a.title.localeCompare(b.title, "es", { sensitivity: "base" })
          );
          break;
        case "alpha-desc":
          sorted.sort((a, b) =>
            b.title.localeCompare(a.title, "es", { sensitivity: "base" })
          );
          break;
      }

      currentPage = 1;
      renderNotes(sorted);
    }

    document.querySelectorAll(".search__filter--option").forEach(btn => {
      btn.addEventListener("click", () => {
        sortNotes(btn.dataset.sort);
      });
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
        return;
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

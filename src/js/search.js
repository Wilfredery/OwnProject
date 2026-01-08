import Swal from "sweetalert2";
import { db, getCurrentUser, onAuthReady } from "./auth.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

(async function () {

  /* ==========================================================
     🔥 CARGAR NOTAS DEL USUARIO ACTUAL (ESPERANDO AUTH)
  ========================================================== */
  async function loadNotes() {
    const user = await onAuthReady(); // ⬅️ CLAVE
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
        created_at: data.created_at ? data.created_at.toDate() : null
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

    if (!searchInput || !resultsContainer || !paginationContainer) return;

    /* ==========================================================
       🔢 PAGINACIÓN
    ========================================================== */
    function renderPagination(totalItems) {
      paginationContainer.innerHTML = "";

      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (totalPages <= 1) return;

      const firstBtn = document.createElement("button");
      firstBtn.textContent = "<<";
      firstBtn.classList.add("search__pagination--page-btn");
      firstBtn.disabled = currentPage === 1;
      firstBtn.addEventListener("click", () => {
        currentPage = 1;
        renderNotes(currentNotes);
      });
      paginationContainer.appendChild(firstBtn);

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "<";
      prevBtn.classList.add("search__pagination--page-btn");
      prevBtn.disabled = currentPage === 1;
      prevBtn.addEventListener("click", () => {
        currentPage--;
        renderNotes(currentNotes);
      });
      paginationContainer.appendChild(prevBtn);

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("search__pagination--page-btn");
        if (i === currentPage) btn.classList.add("active");

        btn.addEventListener("click", () => {
          currentPage = i;
          renderNotes(currentNotes);
        });

        paginationContainer.appendChild(btn);
      }

      const nextBtn = document.createElement("button");
      nextBtn.textContent = ">";
      nextBtn.classList.add("search__pagination--page-btn");
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.addEventListener("click", () => {
        currentPage++;
        renderNotes(currentNotes);
      });
      paginationContainer.appendChild(nextBtn);

      const lastBtn = document.createElement("button");
      lastBtn.textContent = ">>";
      lastBtn.classList.add("search__pagination--page-btn");
      lastBtn.disabled = currentPage === totalPages;
      lastBtn.addEventListener("click", () => {
        currentPage = totalPages;
        renderNotes(currentNotes);
      });
      paginationContainer.appendChild(lastBtn);
    }

    /* ==========================================================
       🟦 RENDERIZAR NOTAS
    ========================================================== */
    function renderNotes(list) {
      resultsContainer.innerHTML = "";
      currentNotes = list;

      if (list.length === 0) {
        resultsContainer.innerHTML = `<p class="no-results" data-i18n="findlist"></p>`;
        paginationContainer.innerHTML = "";
        applyTranslations(currentLangData);
        return;
      }

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
              ${note.created_at
                ? note.created_at.toLocaleDateString(userLocale) + " " +
                  note.created_at.toLocaleTimeString(userLocale, {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : ""}
            </p>
          </div>

          <div class="actions">
            <button class="edit-btn" data-id="${note.id}" data-i18n="editar"></button>
            <button class="delete-btn" data-id="${note.id}" data-i18n="eliminar"></button>
          </div>
        `;

        resultsContainer.appendChild(li);
      });

      applyTranslations(currentLangData);
      renderPagination(list.length);
    }

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
    const filterToggle = document.getElementById("filterToggle");
    const filterPanel = document.getElementById("filterPanel");

    filterToggle.addEventListener("click", () => {
      filterPanel.classList.toggle("hidden");
    });

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
          sorted.sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }));
          break;
        case "alpha-desc":
          sorted.sort((a, b) => b.title.localeCompare(a.title, "es", { sensitivity: "base" }));
          break;
      }

      currentPage = 1;
      renderNotes(sorted);
    }

    document.querySelectorAll(".search__filter--option").forEach(btn => {
      btn.addEventListener("click", () => {
        sortNotes(btn.dataset.sort);
        filterPanel.classList.add("hidden");
      });
    });

    /* ==========================================================
       ✏️ EDITAR / 🗑️ ELIMINAR
    ========================================================== */
    resultsContainer.addEventListener("click", async (e) => {

      if (e.target.classList.contains("edit-btn")) {
        const id = e.target.dataset.id;

        const result = await Swal.fire({
          title: "¿Editar nota?",
          text: "Vas a editar esta nota.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, editar",
          cancelButtonText: "Cancelar",
          customClass: { popup: "minimal-alert" },
          reverseButtons: true
        });

        if (result.isConfirmed) {
          window.location.href = `/editar/${id}`;
        }
        return;
      }

      if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;

        const result = await Swal.fire({
          title: "¿Eliminar nota?",
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          customClass: { popup: "minimal-alert" },
          reverseButtons: true
        });

        if (!result.isConfirmed) return;

        const ok = await deleteNoteFromFirestore(id);
        if (!ok) return;

        notes = notes.filter(n => n.id !== id);

        const totalPages = Math.ceil(notes.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages) currentPage = totalPages;

        renderNotes(notes);

        Swal.fire({
          title: "Eliminada",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" }
        });
      }
    });

  });
})();

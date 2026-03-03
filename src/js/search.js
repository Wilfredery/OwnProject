// src/js/search.js
import Swal from "sweetalert2";
import { db, onAuthReady } from "./auth.js";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { t } from "./i18n/index.js";

(async function () {
  document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const paginationContainer = document.getElementById("pagination");
    const emptyState = document.getElementById("empty-state");
    const filterToggle = document.getElementById("filterToggle");
    const filterPanel = document.getElementById("filterPanel");
    const filterOptions = document.querySelectorAll(".search__filter--option");

    if (!searchInput || !resultsContainer || !paginationContainer || !emptyState) return;

    let notes = [];
    let currentPage = 1;
    const ITEMS_PER_PAGE = 5;
    const userLocale = navigator.language || "es-ES";

    emptyState.textContent = t("loadingNotes");
    emptyState.style.display = "block";

    const authState = await onAuthReady();

    /* ========================
       GUEST NOTES
    ======================== */
    if (!authState || authState.role === "guest") {
      notes = (JSON.parse(localStorage.getItem("guestNotes")) || []).map(n => ({
        ...n,
        created_at: n.created_at ? new Date(n.created_at) : null
      }));

      const deleteGuestNote = id => {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem("guestNotes", JSON.stringify(notes));
      };

      initUI({
        onEdit: id => confirmEdit(id),
        onDelete: id => confirmDelete(id, deleteGuestNote)
      });

      initFilters();
      renderNotes(notes);
      return;
    }

    /* ========================
       NON-VERIFIED USER
    ======================== */
    if (authState.role !== "verified") {
      window.location.href = "/login";
      return;
    }

    /* ========================
       VERIFIED USER
    ======================== */
    const user = authState.user;

    const loadAuthNotes = async () => {
      const data = [];
      const snap = await getDocs(query(collection(db, "notes"), where("uid", "==", user.uid)));
      snap.forEach(d => {
        const n = d.data();
        data.push({ id: d.id, title: n.title, content: n.content, created_at: n.created_at ? n.created_at.toDate() : null });
      });
      return data;
    };

    const deleteAuthNote = async id => {
      await deleteDoc(doc(db, "notes", id));
      notes = notes.filter(n => n.id !== id);
    };

    notes = await loadAuthNotes();

    initUI({
      onEdit: id => confirmEdit(id),
      onDelete: id => confirmDelete(id, deleteAuthNote, true)
    });

    initFilters();
    renderNotes(notes);

    /* ========================
       UI HANDLERS
    ======================== */
    function initUI({ onEdit, onDelete }) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        currentPage = 1;
        renderNotes(notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)));
      });

      resultsContainer.addEventListener("click", async e => {
        if (e.target.classList.contains("edit-btn")) await onEdit(e.target.dataset.id);
        if (e.target.classList.contains("delete-btn")) await onDelete(e.target.dataset.id);
      });
    }

    async function confirmEdit(id) {
      const res = await Swal.fire({
        title: t("askEditNote"),
        icon: "question",
        showCancelButton: true,
        confirmButtonText: t("confirmEditNote"),
        cancelButtonText: t("cancelEditNote"),
        customClass: { popup: "minimal-alert" }
      });
      if (res.isConfirmed) window.location.href = `/editar/${id}`;
    }

    async function confirmDelete(id, deleteFn, isAuth = false) {
      const res = await Swal.fire({
        title: t("askDelete"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: isAuth ? t("confirmDelete") : t("confirmDelete"),
        cancelButtonText: isAuth ? t("cancelDelete") : t("cancelDelete"),
        customClass: { popup: "minimal-alert" }
      });
      if (!res.isConfirmed) return;
      await deleteFn(id);
      renderNotes(notes);
    }

    /* ========================
       FILTERS
    ======================== */
    function initFilters() {
      if (!filterToggle || !filterPanel) return;

      filterToggle.addEventListener("click", () => filterPanel.classList.toggle("hidden"));
      filterOptions.forEach(btn => btn.addEventListener("click", () => {
        sortNotes(btn.dataset.sort);
        filterPanel.classList.add("hidden");
      }));
    }

    function sortNotes(type) {
      switch (type) {
        case "date-desc": notes.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)); break;
        case "date-asc": notes.sort((a, b) => (a.created_at || 0) - (b.created_at || 0)); break;
        case "alpha-asc": notes.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "alpha-desc": notes.sort((a, b) => b.title.localeCompare(a.title)); break;
      }
      currentPage = 1;
      renderNotes(notes);
    }

    /* ========================
       RENDER NOTES & PAGINATION
    ======================== */
    function renderPagination(totalItems) {
      paginationContainer.innerHTML = "";
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (totalPages <= 1) return;

      const MAX_VISIBLE = 10;

      // Determina el bloque actual (1-10, 11-20, etc.)
      const currentBlock = Math.ceil(currentPage / MAX_VISIBLE);
      const startPage = (currentBlock - 1) * MAX_VISIBLE + 1;
      const endPage = Math.min(startPage + MAX_VISIBLE - 1, totalPages);

      // ===== BOTÓN << (PRIMERA PÁGINA) =====
      if (currentPage > 1) {
        const firstBtn = document.createElement("button");
        firstBtn.textContent = "<<";
        firstBtn.classList.add("search__pagination--page-btn");
        firstBtn.onclick = () => {
          currentPage = 1;
          renderNotes(notes);
        };
        paginationContainer.appendChild(firstBtn);
      }

      // ===== BOTÓN < (ANTERIOR) =====
      if (currentPage > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        prevBtn.classList.add("search__pagination--page-btn");
        prevBtn.onclick = () => {
          currentPage--;
          renderNotes(notes);
        };
        paginationContainer.appendChild(prevBtn);
      }

      // ===== NÚMEROS DE PÁGINA =====
      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("search__pagination--page-btn");
        if (i === currentPage) btn.classList.add("active");

        btn.onclick = () => {
          currentPage = i;
          renderNotes(notes);
        };

        paginationContainer.appendChild(btn);
      }

      // ===== BOTÓN > (SIGUIENTE) =====
      if (currentPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        nextBtn.classList.add("search__pagination--page-btn");
        nextBtn.onclick = () => {
          currentPage++;
          renderNotes(notes);
        };
        paginationContainer.appendChild(nextBtn);
      }

      // ===== BOTÓN >> (ÚLTIMA PÁGINA) =====
      if (currentPage < totalPages) {
        const lastBtn = document.createElement("button");
        lastBtn.classList.add("search__pagination--page-btn");
        lastBtn.textContent = ">>";
        lastBtn.onclick = () => {
          currentPage = totalPages;
          renderNotes(notes);
        };
        paginationContainer.appendChild(lastBtn);
      }
    }

    function renderNotes(list) {
      resultsContainer.innerHTML = "";

      if (list.length === 0) {
        emptyState.textContent = t("findlist");
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
            <p class="fecha">${
              note.created_at
                ? `${note.created_at.toLocaleDateString(userLocale)} · ${note.created_at.toLocaleTimeString(userLocale, { hour: "2-digit", minute: "2-digit" })}`
                : ""
            }</p>
          </div>
          <div class="actions">
            <button class="edit-btn" data-id="${note.id}">${t("editar")}</button>
            <button class="delete-btn" data-id="${note.id}">${t("eliminar")}</button>
          </div>
        `;
        resultsContainer.appendChild(li);
      });

      renderPagination(list.length);
    }

  });
})();
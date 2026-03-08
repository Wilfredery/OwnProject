/**
 * ==========================================================
 *  SEARCH+FILTER+LIST MODULE
 * ==========================================================
 *
 * Description:
 * Client-side module responsible for managing the search,
 * filtering, sorting, pagination, and rendering of user notes.
 *
 * This module dynamically adapts its behavior based on the
 * authenticated user state:
 *
 * - Guest users → Notes are stored and managed in localStorage.
 * - Non-verified users → Redirected to /login.
 * - Verified users → Notes are loaded from Firestore.
 *
 * Architectural Responsibilities:
 * - Wait for authentication state resolution.
 * - Load notes from appropriate data source.
 * - Handle edit and delete actions.
 * - Provide filtering (date and alphabetical).
 * - Provide real-time search.
 * - Handle paginated rendering.
 * - Display localized UI feedback using SweetAlert2.
 *
 * Data Sources:
 * - localStorage (guestNotes)
 * - Firestore collection: "notes"
 *
 * Security Considerations:
 * - Firestore queries are scoped by authenticated user UID.
 * - Non-verified users are redirected before data access.
 * - Deletion operations are scoped to user-owned documents.
 *
 * Performance Considerations:
 * - Notes are loaded once and stored in memory.
 * - Pagination limits DOM rendering to 6 items per page.
 * - Sorting operates on in-memory dataset.
 *
 * Dependencies:
 * - sweetalert2
 * - firebase/firestore
 * - ./auth.js
 * - ./i18n/index.js
 * ==========================================================
 */

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
    const ITEMS_PER_PAGE = 10;
    const userLocale = navigator.language || "es-ES";

    emptyState.textContent = t("loadingNotes");
    emptyState.style.display = "block";

    const authState = await onAuthReady();

    /* ==========================================================
       GUEST USER FLOW (localStorage-based persistence)
    ========================================================== */
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

    /* ==========================================================
       NON-VERIFIED USER FLOW (Access Restricted)
    ========================================================== */
    if (authState.role !== "verified") {
      window.location.href = "/login";
      return;
    }

    /* ==========================================================
       VERIFIED USER FLOW (Firestore-based persistence)
    ========================================================== */
    const user = authState.user;

    const loadAuthNotes = async () => {
      const data = [];
      const snap = await getDocs(
        query(collection(db, "notes"), where("uid", "==", user.uid))
      );

      snap.forEach(d => {
        const n = d.data();
        data.push({
          id: d.id,
          title: n.title,
          content: n.content,
          created_at: n.created_at ? n.created_at.toDate() : null
        });
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

    /* ==========================================================
       UI INITIALIZATION
    ========================================================== */
    function initUI({ onEdit, onDelete }) {

      // Real-time search filtering (PRO search ranking)
      searchInput.addEventListener("input", () => {

        const q = searchInput.value.toLowerCase().trim();
        currentPage = 1;

        if (!q) {
          renderNotes(notes);
          return;
        }

        const startsWith = [];
        const titleContains = [];
        const contentContains = [];

        for (const note of notes) {

          const title = note.title.toLowerCase();
          const content = note.content.toLowerCase();

          if (title.startsWith(q)) {
            startsWith.push(note);
            continue;
          }

          if (title.includes(q)) {
            titleContains.push(note);
            continue;
          }

          if (content.includes(q)) {
            contentContains.push(note);
          }

        }

        const results = [
          ...startsWith,
          ...titleContains,
          ...contentContains
        ];

        renderNotes(results);

      });

      // Delegated click handling for edit/delete buttons
      resultsContainer.addEventListener("click", async e => {
        if (e.target.classList.contains("edit-btn"))
          await onEdit(e.target.dataset.id);

        if (e.target.classList.contains("delete-btn"))
          await onDelete(e.target.dataset.id);
      });
    }

    /* ==========================================================
       CONFIRMATION MODALS
    ========================================================== */
    async function confirmEdit(id) {
      const res = await Swal.fire({
        title: t("askEditNote"),
        icon: "question",
        showCancelButton: true,
        confirmButtonText: t("confirmEditNote"),
        cancelButtonText: t("cancelEditNote"),
        customClass: { popup: "minimal-alert" }
      });

      if (res.isConfirmed) {
        window.location.href = `/editar/${id}`;
      }
    }

    async function confirmDelete(id, deleteFn, isAuth = false) {
      const res = await Swal.fire({
        title: t("askDelete"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("confirmDelete"),
        cancelButtonText: t("cancelDelete"),
        customClass: { popup: "minimal-alert" }
      });

      if (!res.isConfirmed) return;

      await deleteFn(id);
      renderNotes(notes);
    }

    /* ==========================================================
       FILTERING & SORTING
    ========================================================== */
    function initFilters() {
      if (!filterToggle || !filterPanel) return;

      filterToggle.addEventListener("click", () =>
        filterPanel.classList.toggle("hidden")
      );

      filterOptions.forEach(btn =>
        btn.addEventListener("click", () => {
          sortNotes(btn.dataset.sort);
          filterPanel.classList.add("hidden");
        })
      );
    }

      /* ==========================================================
      NATURAL SORT FUNCTION
      ========================================================== */
    function naturalCompare(a, b) {
      const ax = [];
      const bx = [];

      a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
        ax.push([$1 || Infinity, $2 || ""]);
      });
      b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
        bx.push([$1 || Infinity, $2 || ""]);
      });

      while (ax.length && bx.length) {
        const an = ax.shift();
        const bn = bx.shift();
        const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if (nn) return nn;
      }

      return ax.length - bx.length;
    }

    function sortNotes(type) {
      switch (type) {
        case "date-desc":
          notes.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
          break;
        case "date-asc":
          notes.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
          break;
        case "alpha-asc":
          notes.sort((a, b) => naturalCompare(a.title, b.title));
          break;
        case "alpha-desc":
          notes.sort((a, b) => naturalCompare(b.title, a.title));
          break;
      }

      currentPage = 1;
      renderNotes(notes);
    }

    /* ==========================================================
       PAGINATION & RENDERING
    ========================================================== */
    function renderPagination(totalItems) {
      paginationContainer.innerHTML = "";

      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (totalPages <= 1) return;

      const MAX_VISIBLE = 10;
      const currentBlock = Math.ceil(currentPage / MAX_VISIBLE);
      const startPage = (currentBlock - 1) * MAX_VISIBLE + 1;
      const endPage = Math.min(startPage + MAX_VISIBLE - 1, totalPages);

      // First page button
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

      // Previous button
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

      // Page numbers
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

      // Next button
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

      // Last page button
      if (currentPage < totalPages) {
        const lastBtn = document.createElement("button");
        lastBtn.textContent = ">>";
        lastBtn.classList.add("search__pagination--page-btn");
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
            <p class="fecha">
              ${
                note.created_at
                  ? `${note.created_at.toLocaleDateString(userLocale)} · 
                     ${note.created_at.toLocaleTimeString(userLocale, {
                       hour: "2-digit",
                       minute: "2-digit"
                     })}`
                  : ""
              }
            </p>
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
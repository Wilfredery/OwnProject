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

(function () {

  document.addEventListener("DOMContentLoaded", async () => {

    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");
    const paginationContainer = document.getElementById("pagination");
    const emptyState = document.getElementById("empty-state");

    /* 🟦 FILTROS */
    const filterToggle = document.getElementById("filterToggle");
    const filterPanel = document.getElementById("filterPanel");
    const filterOptions = document.querySelectorAll(".search__filter--option");

    if (!searchInput || !resultsContainer || !paginationContainer || !emptyState) return;

    let notes = [];
    let currentPage = 1;
    const ITEMS_PER_PAGE = 10;
    const userLocale = navigator.language || "es-ES";

    /* ==========================================================
       ⏳ ESTADO INICIAL
    ========================================================== */
    emptyState.textContent = t("loadingNotes");
    emptyState.style.display = "block";
    resultsContainer.innerHTML = "";
    paginationContainer.innerHTML = "";

    /* ==========================================================
       🔐 AUTH
    ========================================================== */
    const authState = await onAuthReady();

    /* ==========================================================
       👤 GUEST
    ========================================================== */
    if (!authState || authState.role === "guest") {

      notes = (JSON.parse(localStorage.getItem("guestNotes")) || []).map(n => ({
        ...n,
        created_at: n.created_at ? new Date(n.created_at) : null
      }));

      function deleteGuestNote(id) {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem("guestNotes", JSON.stringify(notes));
      }

      renderNotes(notes);

      initUI({
        onEdit: async id => {
          const result = await Swal.fire({
            title: t("askEdit"),
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t("confirmEdit"),
            cancelButtonText: t("cancelEdit"),
            customClass: { popup: "minimal-alert" }
          });

          if (result.isConfirmed) {
            window.location.href = `/editar/${id}`;
          }
        },
        onDelete: async id => {
          const result = await Swal.fire({
            title: t("askDelete"),
            icon: "warning",
            showCancelButton: true,
            customClass: { popup: "minimal-alert" }
          });

          if (!result.isConfirmed) return;
          deleteGuestNote(id);
          renderNotes(notes);
        }
      });

      initFilters();
      return;
    }

    /* ==========================================================
       🟡 AUTH NO VERIFICADO
    ========================================================== */
    if (authState.role !== "verified") {
      window.location.href = "/";
      return;
    }

    /* ==========================================================
       🟢 AUTH VERIFICADO
    ========================================================== */
    const user = authState.user;

    async function loadAuthNotes() {
      const data = [];
      const q = query(
        collection(db, "notes"),
        where("uid", "==", user.uid)
      );

      const snap = await getDocs(q);
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
    }

    async function deleteAuthNote(id) {
      await deleteDoc(doc(db, "notes", id));
      notes = notes.filter(n => n.id !== id);
    }

    notes = await loadAuthNotes();
    renderNotes(notes);

    initUI({
      onEdit: async id => {
        const result = await Swal.fire({
          title: t("askEditNote"),
          icon: "question",
          showCancelButton: true,
          confirmButtonText: t("confirmEditNote"),
          cancelButtonText: t("cancelEditNote"),
          customClass: { popup: "minimal-alert" }
        });

        if (result.isConfirmed) {
          window.location.href = `/editar/${id}`;
        }
      },
      onDelete: async id => {
        const result = await Swal.fire({
          title: t("askDelete"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: t("confirmDelete"),
          cancelButtonText: t("cancelDelete"),
          customClass: { popup: "minimal-alert" }
        });

        if (!result.isConfirmed) return;
        await deleteAuthNote(id);
        renderNotes(notes);
      }
    });

    initFilters();

    /* ==========================================================
       🧠 UI
    ========================================================== */
    function initUI({ onEdit, onDelete }) {

      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        currentPage = 1;

        renderNotes(
          notes.filter(n =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
          )
        );
      });

      resultsContainer.addEventListener("click", async e => {
        if (e.target.classList.contains("edit-btn")) {
          await onEdit(e.target.dataset.id);
        }

        if (e.target.classList.contains("delete-btn")) {
          await onDelete(e.target.dataset.id);
        }
      });
    }

    /* ==========================================================
       🔽 FILTROS
    ========================================================== */
    function initFilters() {
      if (!filterToggle || !filterPanel) return;

      filterToggle.addEventListener("click", () => {
        filterPanel.classList.toggle("hidden");
      });

      filterOptions.forEach(btn => {
        btn.addEventListener("click", () => {
          sortNotes(btn.dataset.sort);
          filterPanel.classList.add("hidden");
        });
      });
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
          notes.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "alpha-desc":
          notes.sort((a, b) => b.title.localeCompare(a.title));
          break;
      }

      currentPage = 1;
      renderNotes(notes);
    }

    /* ==========================================================
       🖼️ RENDER
    ========================================================== */
    function renderPagination(totalItems) {
      paginationContainer.innerHTML = "";
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
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
              ${note.created_at ? note.created_at.toLocaleDateString(userLocale) : ""}
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
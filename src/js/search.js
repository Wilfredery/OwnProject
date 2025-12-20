import { db } from "./firebase.js";
import Swal from "sweetalert2";

import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

(async function () {

  // 🔥 Cargar notas desde Firebase
  async function loadNotes() {
    const notes = [];
    const querySnapshot = await getDocs(collection(db, "notes"));

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


  // 🔥 Eliminar nota REAL desde Firebase
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

    // 🟡 Cargar notas reales
    let notes = await loadNotes();
    const userLocale = navigator.language || "es-ES";
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");

    if (!searchInput || !resultsContainer) return; // 🛑 Evita errores


    /* ==========================================================
       🟦 RENDERIZAR NOTAS
    =========================================================== */
    function renderNotes(filteredNotes) {
      resultsContainer.innerHTML = "";

      if (filteredNotes.length === 0) {
        resultsContainer.innerHTML = `<p class="no-results" data-i18n="findlist"></p>`;
        applyTranslations(currentLangData);

        return;
      }

      filteredNotes.forEach(note => {
        const li = document.createElement("li");
        li.classList.add("note-item");

        //<p class="fecha">${note.created_at ? note.created_at.toLocaleDateString() : ""}</p>
        li.innerHTML = `
          <div class="info">
              <h3>${note.title}</h3>
              <p>${note.content.substring(0, 60)}...</p>
              <p class="fecha">
                ${note.created_at 
                  ? note.created_at.toLocaleDateString(userLocale) + 
                    " " + 
                    note.created_at.toLocaleTimeString(userLocale, { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) 
                  : ""}
              </p>
          </div>

          <div class="actions">
              <button class="edit-btn" data-id="${note.id}" data-i18n="editar"></button>
              <button class="delete-btn" data-id="${note.id}" data-i18n="eliminar"></button>
          </div>
        `;

        applyTranslations(currentLangData);
        resultsContainer.appendChild(li);
      });
    }


    // 👉 Mostrar todas al inicio
    renderNotes(notes);


    /* ==========================================================
       🟦 BÚSQUEDA
    =========================================================== */
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );

      renderNotes(filtered);
    });



    /* ==========================================================
       🟦 FILTROS (Fecha: reciente/antigua, A-Z / Z-A)
    =========================================================== */

    const filterToggle = document.getElementById("filterToggle");
    const filterPanel = document.getElementById("filterPanel");

    // Abrir / cerrar panel
    filterToggle.addEventListener("click", () => {
      filterPanel.classList.toggle("hidden");
    });

    // Función de ordenamiento
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

      renderNotes(sorted);
    }

    // Oír clicks en botones del panel
    document.querySelectorAll(".search__filter--option").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.sort;
        sortNotes(type);
        filterPanel.classList.add("hidden");
      });
    });



    /* ==========================================================
       ⭐⭐⭐ EDITAR + ELIMINAR ⭐⭐⭐
    =========================================================== */
    resultsContainer.addEventListener("click", async (e) => {

      /* --------- EDITAR --------- */
      if (e.target.classList.contains("edit-btn")) {
        const id = e.target.dataset.id;

        Swal.fire({
          title: "¿Editar nota?",
          text: "Vas a editar esta nota.",
          icon: "question",
          showCancelButton: true,
          customClass: { 
            popup: 'minimal-alert' 
          },
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#e74c3c",
          confirmButtonText: "Sí, editar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
          backdrop: true,
          allowOutsideClick: true,
          heightAuto: false
        }).then(result => {

          if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: "Cancelado",
              text: "No se abrió el editor.",
              icon: "info",
              timer: 1200,
              customClass: { 
                popup: 'minimal-alert' 
              }
            });
            return;
          }

          if (result.isConfirmed) {
            window.location.href = `/editar/${id}`;
          }

        });

        return;
      }

      /* --------- ELIMINAR --------- */
      if (e.target.classList.contains("delete-btn")) {

        const id = e.target.dataset.id;

        Swal.fire({
          title: "¿Eliminar nota?",
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          customClass: { 
            popup: 'minimal-alert' 
          },
          showCancelButton: true,
          confirmButtonColor: "#e74c3c",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
          backdrop: true,
          allowOutsideClick: true,
          heightAuto: false
        }).then(async (result) => {

          if (result.dismiss === Swal.DismissReason.backdrop) return;

          if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: "Cancelado",
              text: "La nota no fue eliminada.",
              icon: "info",
              timer: 1200,
              customClass: { 
                popup: 'minimal-alert' 
              },
              confirmButtonColor: "#3085d6"
            });
            return;
          }

          if (result.isConfirmed) {

            const ok = await deleteNoteFromFirestore(id);

            if (!ok) {
              Swal.fire({
                title: "Error",
                text: "Hubo un problema eliminando la nota.",
                icon: "error",
                timer: 1500,
              });
              return;
            }

            // 🧹 Actualizar lista local
            notes = notes.filter(n => n.id !== id);
            renderNotes(notes);

            Swal.fire({
              title: "Eliminada",
              text: "La nota fue eliminada correctamente.",
              icon: "success",
              timer: 1500,
              customClass: { 
                popup: 'minimal-alert' 
              },
              confirmButtonColor: "#3085d6"
            });
          }
        });
      }
    });

  });
})();

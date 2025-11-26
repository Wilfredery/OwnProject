(function () {

document.addEventListener("DOMContentLoaded", () => {

    const notes = [
        { id: "1", title: "Tarea de JavaScript", content: "Aprender funciones" },
        { id: "2", title: "Compras", content: "Leche, pan, huevos" },
        { id: "3", title: "Ideas de proyecto", content: "App de notas con Firebase" },
    ];

    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results");

    function renderNotes(filteredNotes) {
        resultsContainer.innerHTML = "";

        if (filteredNotes.length === 0) {
            resultsContainer.innerHTML = `<p class="no-results">No se encontraron notas</p>`;
            return;
        }

        filteredNotes.forEach(note => {
            const li = document.createElement("li");
            li.classList.add("note-item");

            li.innerHTML = `
                <div class="info">
                    <h3>${note.title}</h3>
                    <p>${note.content.substring(0, 60)}...</p>
                </div>

                <div class="actions">
                    <button class="edit-btn" data-id="${note.id}">✏ Editar</button>
                    <button class="delete-btn" data-id="${note.id}">🗑 Eliminar</button>
                </div>
            `;

            resultsContainer.appendChild(li);
        });
    }

    // 👉 Mostrar todas al inicio
    renderNotes(notes);

    // 👉 Filtrar desde la primera letra
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = notes.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );

        renderNotes(filtered);
    });

    // ⭐⭐⭐ AQUI AGREGO LO DEL PASO 5 (EDITAR) ⭐⭐⭐
    resultsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-btn")) {
            const id = e.target.dataset.id;
            window.location.href = `/editar/${id}`;
        }
    });

});

})();

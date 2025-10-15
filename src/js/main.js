(function () {
    const notes = []; // simulando notas guardadas
    const createBtn = document.querySelector('.create-btn');
    createBtn.textContent = notes.length === 0
    ? 'CREATE YOUR FIRST NOTE'
    : 'CREATE A NOTE';
})();
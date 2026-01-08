
const customSelects = document.querySelectorAll(".custom-select");

if (customSelects.length > 0) {
  customSelects.forEach((customSelect) => {
    const selected = customSelect.querySelector(".selected");
    const options = customSelect.querySelectorAll(".options li");

    if (!selected || options.length === 0) return;

    selected.addEventListener("click", () => {
      customSelect.classList.toggle("open");
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        selected.textContent = option.textContent;
        customSelect.classList.remove("open");
      });
    });
  });
}
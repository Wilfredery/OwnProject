/**
 * ==========================================================
 *  CUSTOM SELECT FROM ACC-SETT.JS MODULE
 * ==========================================================
 *
 * Description:
 * Implements a custom dropdown select component using
 * semantic HTML and JavaScript-driven interaction.
 *
 * This module replaces the default <select> behavior with a
 * stylized, fully controllable dropdown UI.
 *
 * Responsibilities:
 * - Toggle dropdown visibility when clicking the selected element.
 * - Update selected text when an option is chosen.
 * - Close the dropdown when clicking outside the component.
 *
 * Behavior Overview:
 * 1. Each `.custom-select` container is initialized independently.
 * 2. Clicking `.selected` toggles the `open` class.
 * 3. Clicking an option updates the selected label.
 * 4. Clicking anywhere outside closes all dropdowns.
 *
 * UX Considerations:
 * - Uses event.stopPropagation() to prevent unintended closure.
 * - Ensures only active dropdown remains open.
 * - Gracefully exits if required elements are missing.
 *
 * Limitations:
 * - Does not sync with native <select> elements.
 * - Does not persist selected state across page reloads.
 * - Does not include keyboard accessibility support.
 *
 * Dependencies:
 * - None (Vanilla JavaScript)
 * ==========================================================
 */

const customSelects = document.querySelectorAll(".custom-select");

customSelects.forEach((customSelect) => {
  const selected = customSelect.querySelector(".selected");
  const options = customSelect.querySelectorAll(".options li");

  // Skip initialization if structure is incomplete
  if (!selected || options.length === 0) return;

  /**
   * Toggle dropdown visibility when clicking the selected element.
   * stopPropagation prevents immediate closure by document listener.
   */
  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    customSelect.classList.toggle("open");
  });

  /**
   * Update displayed value when an option is selected.
   */
  options.forEach(option =>
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      customSelect.classList.remove("open");
    })
  );
});

/**
 * Global click listener to close any open custom select
 * when clicking outside the component.
 */
document.addEventListener("click", () => {
  customSelects.forEach(cs => cs.classList.remove("open"));
});
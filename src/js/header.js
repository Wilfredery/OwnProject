/**
 * ============================================================
 *  HEADER DROPDOWN MENU MODULE
 * ============================================================
 *
 * Handles interactive behavior for the header dropdown menu.
 *
 * Features:
 * - Toggle menu visibility
 * - Prevent unwanted close on internal clicks
 * - Close menu when clicking outside
 *
 * CSS Dependency:
 * - The "open" class controls visibility state
 *
 * ============================================================
 */

/**
 * Initializes header dropdown behavior.
 */
export function initHeaderMenu() {

  const btn = document.querySelector(".menu-btn");
  const menu = document.querySelector(".dropdown-menu");

  /**
   * Exit if required elements do not exist
   * (Prevents errors on pages without header menu)
   */
  if (!btn || !menu) return;

  /* ============================================================
     TOGGLE MENU
  ============================================================ */

  btn.addEventListener("click", (e) => {

    /**
     * Prevent event bubbling to document
     * so the menu does not immediately close
     */
    e.stopPropagation();

    menu.classList.toggle("open");
  });

  /* ============================================================
     PREVENT INTERNAL CLOSING
  ============================================================ */

  menu.addEventListener("click", (e) => {

    /**
     * Prevent clicks inside menu
     * from triggering document listener
     */
    e.stopPropagation();
  });

  /* ============================================================
     CLOSE ON OUTSIDE CLICK
  ============================================================ */

  document.addEventListener("click", () => {

    /**
     * Remove visibility class when
     * clicking anywhere outside menu
     */
    menu.classList.remove("open");
  });
}

/* ============================================================
   AUTO INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initHeaderMenu();
});
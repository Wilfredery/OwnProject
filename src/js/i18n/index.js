/**
 * ============================================================
 *  INTERNATIONALIZATION MODULE (i18n)
 * ============================================================
 *
 * This module manages language translations for the frontend.
 *
 * Responsibilities:
 * - Load available language dictionaries
 * - Persist selected language in localStorage
 * - Provide translation helper function (t)
 * - Apply translations dynamically to DOM elements
 *
 * Supported languages:
 * - Spanish (es)
 * - English (en)
 *
 * Translation is handled via custom data attributes:
 * - data-i18n
 * - data-i18n-placeholder
 * - data-i18n-title
 * - data-i18n-alt
 * - data-i18n-value
 *
 * ============================================================
 */

import es from "./es.js";
import en from "./en.js";

// ------------------------------------------------------------
// 🌍 Available Languages
// ------------------------------------------------------------

/**
 * Dictionary container for supported languages.
 */
const languages = { es, en };

// ------------------------------------------------------------
// 🧠 Current Language State
// ------------------------------------------------------------

/**
 * Retrieves saved language from localStorage.
 * Defaults to Spanish if none is stored.
 */
let currentLang = localStorage.getItem("lang") || "es";
let currentLangData = languages[currentLang];

// ------------------------------------------------------------
// 🔤 Translation Helper
// ------------------------------------------------------------

/**
 * Returns translated value for a given key.
 * If key does not exist, returns the key itself
 * as a safe fallback.
 *
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  return currentLangData[key] || key;
}

// ------------------------------------------------------------
// 📌 Get Current Language
// ------------------------------------------------------------

/**
 * Returns the currently active language code.
 *
 * @returns {string}
 */
export function getLang() {
  return currentLang;
}

// ------------------------------------------------------------
// 🔄 Set Language
// ------------------------------------------------------------

/**
 * Changes active language if supported.
 * Persists selection in localStorage
 * and reapplies translations to the DOM.
 *
 * @param {string} lang
 */
export function setLang(lang) {
  if (!languages[lang]) return;

  currentLang = lang;
  currentLangData = languages[lang];
  localStorage.setItem("lang", lang);

  applyTranslations();
}

// ------------------------------------------------------------
// 🌐 Apply Translations to DOM
// ------------------------------------------------------------

/**
 * Scans the DOM (or a specific root element)
 * for translation data attributes and updates:
 *
 * - textContent
 * - placeholder
 * - title
 * - alt
 * - value
 *
 * @param {HTMLElement|Document} root
 */
export function applyTranslations(root = document) {

  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (currentLangData[key]) el.textContent = currentLangData[key];
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (currentLangData[key]) el.placeholder = currentLangData[key];
  });

  root.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.dataset.i18nTitle;
    if (currentLangData[key]) el.title = currentLangData[key];
  });

  root.querySelectorAll("[data-i18n-alt]").forEach(el => {
    const key = el.dataset.i18nAlt;
    if (currentLangData[key]) el.alt = currentLangData[key];
  });

  root.querySelectorAll("[data-i18n-value]").forEach(el => {
    const key = el.dataset.i18nValue;
    if (currentLangData[key]) el.value = currentLangData[key];
  });

}
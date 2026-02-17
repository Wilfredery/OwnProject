//i18n/index.js
import es from "./es.js";
import en from "./en.js";

const languages = { es, en };

let currentLang = localStorage.getItem("lang") || "es";
let currentLangData = languages[currentLang];

export function t(key) {
  return currentLangData[key] || key;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (!languages[lang]) return;

  currentLang = lang;
  currentLangData = languages[lang];
  localStorage.setItem("lang", lang);

  applyTranslations(); // ✅ aquí SÍ va
}

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
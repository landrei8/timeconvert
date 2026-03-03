// ============================================================
// WORLD TIME · CITY CLOCK — Central Version Config
// ============================================================
// Edit ONLY this file to update the version across all pages.
// After changing, just refresh any page — it will pick it up automatically.

const APP_VERSION = "v1.6 - 03:07PM EET";
const APP_BUILD_DATE = "March 2026";

// Automatically inject version into any element with class "build-tag"
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.build-tag').forEach(el => {
    el.textContent = APP_VERSION;
  });
});

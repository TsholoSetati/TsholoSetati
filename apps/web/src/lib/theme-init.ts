/**
 * Theme initialization — runs synchronously in <head> to avoid FOUC.
 * Reads stored preference, falls back to system, applies before paint.
 *
 * This script is inlined as a string in BaseLayout — see ThemeScript.astro.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = stored === 'light' || stored === 'dark' ? stored : system;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim();

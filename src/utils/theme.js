export const DEFAULT_THEME = 'dark';

export function getSavedTheme() {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem('theme', nextTheme);
  } catch {}
  window.dispatchEvent(new CustomEvent('atos-theme-change', { detail: nextTheme }));
  return nextTheme;
}

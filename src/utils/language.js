export const DEFAULT_LANGUAGE = 'en';

export function getSavedLanguage() {
  try {
    return localStorage.getItem('atos_language') === 'ar' ? 'ar' : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function applyDocumentLanguage(language) {
  const nextLanguage = language === 'ar' ? 'ar' : DEFAULT_LANGUAGE;
  const root = document.documentElement;
  root.lang = nextLanguage;
  root.dir = nextLanguage === 'ar' ? 'rtl' : 'ltr';
  root.dataset.language = nextLanguage;
  return nextLanguage;
}

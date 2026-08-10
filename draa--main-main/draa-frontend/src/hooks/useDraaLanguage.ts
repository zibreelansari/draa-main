import { useCallback, useEffect, useState } from 'react';

export type DraaLanguage = 'en' | 'hi';

const STORAGE_KEY = 'draa-language';
const LANGUAGE_EVENT = 'draa-language-change';

const getSavedLanguage = (): DraaLanguage => {
  if (typeof window === 'undefined') return 'en';
  return window.localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en';
};

export default function useDraaLanguage() {
  const [language, setLanguageState] = useState<DraaLanguage>(getSavedLanguage);

  useEffect(() => {
    const syncLanguage = (event: Event) => {
      const nextLanguage = (event as CustomEvent<DraaLanguage>).detail;
      if (nextLanguage === 'en' || nextLanguage === 'hi') {
        setLanguageState(nextLanguage);
      }
    };

    window.addEventListener(LANGUAGE_EVENT, syncLanguage);
    document.documentElement.lang = language;

    return () => window.removeEventListener(LANGUAGE_EVENT, syncLanguage);
  }, [language]);

  const setLanguage = useCallback((nextLanguage: DraaLanguage) => {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    setLanguageState(nextLanguage);
    window.dispatchEvent(new CustomEvent<DraaLanguage>(LANGUAGE_EVENT, {
      detail: nextLanguage,
    }));
  }, []);

  return { language, setLanguage };
}

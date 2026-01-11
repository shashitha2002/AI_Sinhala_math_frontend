import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import siTranslations from './locales/si.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      si: {
        translation: siTranslations
      }
    },
    fallbackLng: 'en',
    debug: false,
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,
    keySeparator: '.',
    nsSeparator: false,
    saveMissing: false,
    missingKeyHandler: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;


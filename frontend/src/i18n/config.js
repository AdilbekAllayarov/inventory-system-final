import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ja from './ja.json';
import uz from './uz.json';

const resources = {
  en: en,
  ja: ja,
  uz: uz
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

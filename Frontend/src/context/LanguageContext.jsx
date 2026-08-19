import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTranslation } from '../utils/i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('frs_lang') || 'EN';
  });

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('frs_lang', newLang);
  };

  const t = (key) => {
    return getTranslation(lang, key);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { lang: 'EN', changeLanguage: () => {}, t: (key) => key };
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, getTranslation } from '../i18n/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('silverhands_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('silverhands_lang', language);
  }, [language]);

  const t = (key) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

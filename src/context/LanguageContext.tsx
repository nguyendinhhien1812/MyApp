import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lang, Translations, translations } from '../i18n/translations';

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  t: translations.vi,
  setLang: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('vi');

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n, { setLocale, getLocale } from '../utils/i18n';
import { getSettings, updateSettings } from '../services/settingsService';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const settings = await getSettings();
    const lang = settings.language || 'vi';
    setLocale(lang as Language);
    setLanguageState(lang as Language);
  };

  const setLanguage = async (lang: Language) => {
    setLocale(lang);
    setLanguageState(lang);
    await updateSettings({ language: lang });
    // Force re-render all components using this context
    forceUpdate(prev => prev + 1);
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

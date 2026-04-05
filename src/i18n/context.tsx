import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Language, translations} from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const I18nProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem('app_language').then(lang => {
      if (lang === 'zh' || lang === 'en') {
        setLanguageState(lang);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('app_language', lang);
  }, []);

  const t = useCallback((key: string) => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{language, setLanguage, t}}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

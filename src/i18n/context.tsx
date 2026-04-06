import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Language, translations} from './translations';

type TranslationValues = Record<string, string | number>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, values?: TranslationValues) => string;
}

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
}

function translate(language: Language, key: string, values?: TranslationValues) {
  const template = translations[language][key] ?? translations.en[key] ?? key;
  return interpolate(template, values);
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, values?: TranslationValues) => translate('en', key, values),
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

  const t = useCallback((key: string, values?: TranslationValues) => {
    return translate(language, key, values);
  }, [language]);

  return (
    <I18nContext.Provider value={{language, setLanguage, t}}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

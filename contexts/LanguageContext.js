import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = '@paper_jar_language';
const DEFAULT_LANGUAGE = 'cs';

export const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  translations: {},
  isLoading: false,
  error: null
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backupState, setBackupState] = useState(null);

  // Load saved language preference
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        await setLanguage(savedLanguage);
      } else {
        await setLanguage(DEFAULT_LANGUAGE);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
      setError('Failed to load language preference');
      await setLanguage(DEFAULT_LANGUAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const backupCurrentState = () => {
    setBackupState({
      language,
      translations
    });
  };

  const restorePreviousState = async () => {
    if (backupState) {
      setLanguageState(backupState.language);
      setTranslations(backupState.translations);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, backupState.language);
    }
  };

  const setLanguage = async (newLanguage) => {
    try {
      setIsLoading(true);
      backupCurrentState();

      // Save to AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      
      // Update state
      setLanguageState(newLanguage);
      setError(null);
    } catch (error) {
      console.error('Error setting language:', error);
      setError('Failed to change language');
      await restorePreviousState();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider 
      value={{
        language,
        setLanguage,
        translations,
        isLoading,
        error
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}; 
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@paper_jar_settings_v1';

const DEFAULTS = {
  partyTimerEnabled: false, // off by default per product feedback
  adultConfirmed: false,
  notificationsOptIn: false,
  showRules: true, // "How to play" sheet before every game
  paywallPreview: false, // test-only: turn on premium gating before real payments exist
  premiumUnlocked: false, // simulated purchase until RevenueCat/Paddle is wired
  premiumPlan: null,
  adUnlocks: {}, // { 'deck:workout:classic' | 'skin:halloween': expiresAt }
  drinksAgeConfirmed: false, // legal-drinking-age notice acknowledged
  seasonPreview: false, // test-only: open every seasonal pack
};

const SettingsContext = createContext(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
        }
      } catch (e) {
        // keep defaults
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateSettings = async (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;

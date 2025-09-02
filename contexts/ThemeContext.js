import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR_THEMES = {
  'sunset-orange': {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Coral to soft pink',
    colors: ['#FF6B6B', '#FF8E8E'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  'ocean-blue': {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Turquoise to deep teal',
    colors: ['#4ECDC4', '#44A08D'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  'forest-green': {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Olive to mint green',
    colors: ['#56AB2F', '#A8E6CF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  'royal-purple': {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Light purple to deep purple',
    colors: ['#667eea', '#764ba2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  'warm-sunset': {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    description: 'Peach to lavender',
    colors: ['#FF9A9E', '#FECFEF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  'deep-blue': {
    id: 'deep-blue',
    name: 'Deep Blue',
    description: 'Dark blue to bright blue',
    colors: ['#2C3E50', '#3498DB'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(COLOR_THEMES['sunset-orange']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('selectedColorTheme');
      if (savedThemeId && COLOR_THEMES[savedThemeId]) {
        setCurrentTheme(COLOR_THEMES[savedThemeId]);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (themeId) => {
    try {
      if (COLOR_THEMES[themeId]) {
        setCurrentTheme(COLOR_THEMES[themeId]);
        await AsyncStorage.setItem('selectedColorTheme', themeId);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const getCurrentGradient = () => {
    return {
      colors: currentTheme.colors,
      start: currentTheme.start,
      end: currentTheme.end,
    };
  };

  const value = {
    currentTheme,
    allThemes: Object.values(COLOR_THEMES),
    changeTheme,
    getCurrentGradient,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Global Design Tokens for Paper Jar / OtázoJar
 * Clean, modern design system without glass effects
 */
import { Platform } from 'react-native';
const isAndroid = Platform.OS === 'android';

export const tokens = {
  // Color palette
  colors: {
    // Primary gradient colors
    primary: {
      purple: '#667eea',
      pink: '#f093fb',
      darkPurple: '#5a67d8',
    },
    
    // Background overlays - clean, no blur
    surface: {
      light: 'rgba(255, 255, 255, 0.12)',
      medium: 'rgba(255, 255, 255, 0.18)',
      strong: 'rgba(255, 255, 255, 0.25)',
      selected: 'rgba(255, 255, 255, 0.3)',
    },
    
    // Border colors
    border: {
      light: 'rgba(255, 255, 255, 0.2)',
      medium: 'rgba(255, 255, 255, 0.3)',
      strong: 'rgba(255, 255, 255, 0.5)',
    },
    
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
      muted: 'rgba(255, 255, 255, 0.6)',
      accent: '#667eea',
    },
    
    // Interactive states
    interactive: {
      active: '#ffffff',
      pressed: 'rgba(255, 255, 255, 0.9)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
  },
  
  // Typography scale
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 40,
      '5xl': 48,
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },
  
  // Border radius scale
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  
  // Shadows (platform-tuned)
  shadows: {
    none: {},
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isAndroid ? 0.06 : 0.1,
      shadowRadius: isAndroid ? 1 : 2,
      elevation: isAndroid ? 1 : 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isAndroid ? 1 : 2 },
      shadowOpacity: isAndroid ? 0.08 : 0.15,
      shadowRadius: isAndroid ? 2 : 4,
      elevation: isAndroid ? 2 : 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isAndroid ? 2 : 4 },
      shadowOpacity: isAndroid ? 0.1 : 0.2,
      shadowRadius: isAndroid ? 4 : 8,
      elevation: isAndroid ? 3 : 8,
    },
  },
  
  // Component sizes
  components: {
    button: {
      sm: { padding: 12, minHeight: 40 },
      md: { padding: 16, minHeight: 48 },
      lg: { padding: 20, minHeight: 56 },
    },
    card: {
      sm: { padding: 16, minHeight: 80 },
      md: { padding: 20, minHeight: 120 },
      lg: { padding: 24, minHeight: 140 },
    },
    icon: {
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
      '2xl': 48,
    },
  },
};

// Gradient definitions
export const gradients = {
  primary: {
    colors: ['#667eea', '#f093fb'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondary: {
    colors: ['#a8edea', '#fed6e3'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

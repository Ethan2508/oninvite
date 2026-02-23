/**
 * ThemeContext - Gestion dynamique des couleurs et fonts
 * Les couleurs sont chargées depuis la config de l'événement
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { EventConfig } from '../types';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    error: string;
    success: string;
    warning: string;
    border: string;
    card: string;
    placeholder: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

// Thème par défaut (utilisé si la config n'est pas chargée)
const defaultTheme: Theme = {
  colors: {
    primary: '#D4AF37',
    secondary: '#1A1A2E',
    accent: '#F5E6CC',
    background: '#FFFFFF',
    text: '#333333',
    textLight: '#FFFFFF',
    error: '#E74C3C',
    success: '#27AE60',
    warning: '#F39C12',
    border: '#E0E0E0',
    card: '#FAFAFA',
    placeholder: '#999999',
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Lato',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

interface ThemeProviderProps {
  config?: EventConfig | null;
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ config, children }) => {
  // Construire le thème à partir de la config
  const theme: Theme = config
    ? {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: config.branding.colors.primary,
          secondary: config.branding.colors.secondary,
          accent: config.branding.colors.accent,
          background: config.branding.colors.background,
          text: config.branding.colors.text,
          textLight: config.branding.colors.text_light || '#FFFFFF',
        },
        fonts: {
          heading: config.branding.fonts?.heading || defaultTheme.fonts.heading,
          body: config.branding.fonts?.body || defaultTheme.fonts.body,
        },
      }
    : defaultTheme;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

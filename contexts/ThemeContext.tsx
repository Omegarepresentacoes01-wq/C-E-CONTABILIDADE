import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemePreferences, ThemeMode, PrimaryColor } from '../types';
import { getThemePreferences, saveThemePreferences } from '../services/storageService';

interface ThemeContextType {
  theme: ThemeMode;
  primaryColor: PrimaryColor;
  setTheme: (mode: ThemeMode) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
  // Helpers for Tailwind classes based on primary color
  colors: {
    bg: string;
    bgHover: string;
    bgLight: string;
    text: string;
    border: string;
    ring: string;
    gradientFrom: string;
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(getThemePreferences());

  useEffect(() => {
    // Apply Dark Mode
    if (preferences.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save
    saveThemePreferences(preferences);
  }, [preferences]);

  const setTheme = (mode: ThemeMode) => setPreferences(prev => ({ ...prev, mode }));
  const setPrimaryColor = (color: PrimaryColor) => setPreferences(prev => ({ ...prev, primaryColor: color }));

  // Dynamic class mapping
  const getColorClasses = (color: PrimaryColor) => {
    return {
      bg: `bg-${color}-600`,
      bgHover: `hover:bg-${color}-700`,
      bgLight: `bg-${color}-50`,
      text: `text-${color}-600`,
      border: `border-${color}-200`,
      ring: `focus:ring-${color}-500`,
      gradientFrom: `from-${color}-400`,
    };
  };

  const value = {
    theme: preferences.mode,
    primaryColor: preferences.primaryColor,
    setTheme,
    setPrimaryColor,
    colors: getColorClasses(preferences.primaryColor),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
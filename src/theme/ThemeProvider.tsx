import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { createTheme, ThemeMode, Theme } from './theme';

type ThemePreference = ThemeMode | 'system';

interface ThemeContextType {
  theme: Theme;
  mode: ThemePreference;
  setMode: (mode: ThemePreference) => void;
  effectiveMode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'themeMode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [userPreference, setUserPreference] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved preference
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved) {
        setUserPreference(saved as ThemePreference);
      }
      setIsLoaded(true);
    });
  }, []);

  const effectiveMode: ThemeMode =
    userPreference === 'system'
      ? (systemColorScheme ?? 'light')
      : userPreference;

  const theme = createTheme(effectiveMode);

  const setMode = async (mode: ThemePreference) => {
    setUserPreference(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // Don't render until we've loaded the preference to avoid flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, mode: userPreference, setMode, effectiveMode }}
    >
      <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

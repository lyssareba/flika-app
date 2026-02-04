import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
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
  const [userPreference, setUserPreference] =
    useState<ThemePreference>('system');

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
          setUserPreference(saved as ThemePreference);
        }
      } catch {
        // Silently fall back to system preference
      }
    };
    loadPreference();
  }, []);

  const effectiveMode: ThemeMode =
    userPreference === 'system'
      ? (systemColorScheme ?? 'light')
      : userPreference;

  const theme = useMemo(() => createTheme(effectiveMode), [effectiveMode]);

  const setMode = async (mode: ThemePreference) => {
    setUserPreference(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Preference updated in memory but failed to persist
      // Will fall back to system on next app launch
    }
  };

  const contextValue = useMemo(
    () => ({ theme, mode: userPreference, setMode, effectiveMode }),
    [theme, userPreference, effectiveMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
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

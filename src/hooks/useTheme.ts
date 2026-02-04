import { useTheme as useEmotionTheme } from '@emotion/react';
import { Theme } from '@/theme/theme';
import { useThemeContext } from '@/theme/ThemeProvider';

/**
 * Hook to access the current theme object.
 * Use this when you only need theme values for styling.
 */
export const useTheme = () => {
  return useEmotionTheme() as Theme;
};

/**
 * Hook to access theme context including mode switching.
 * Use this when you need to change the theme mode.
 */
export { useThemeContext } from '@/theme/ThemeProvider';

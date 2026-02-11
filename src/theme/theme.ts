import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export type ThemeMode = 'light' | 'dark';

interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const createShadow = (
  mode: ThemeMode,
  offsetY: number,
  radius: number,
  opacity: { light: number; dark: number },
  elevation: number
): Shadow => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: mode === 'light' ? opacity.light : opacity.dark,
  shadowRadius: radius,
  elevation,
});

export const createTheme = (mode: ThemeMode) => ({
  mode,
  colors: {
    primary: colors.primary[500],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[700],
    secondary: colors.secondary[500],
    accent: colors.accent[500],
    background: colors.background[mode],
    backgroundCard: colors.background.card[mode],
    backgroundElevated: colors.background.elevated[mode],
    textPrimary: colors.text.primary[mode],
    textSecondary: colors.text.secondary[mode],
    textMuted: colors.text.muted[mode],
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    info: colors.semantic.info,
    traitUnknown: colors.trait.unknown.background[mode],
    traitUnknownText: colors.trait.unknown.text[mode],
    traitYes: colors.trait.yes.background[mode],
    traitYesText: colors.trait.yes.text[mode],
    traitNo: colors.trait.no.background[mode],
    traitNoText: colors.trait.no.text[mode],
    peach: colors.peach,
    textOnPrimary: '#FFFFFF',
    border: mode === 'light' ? '#E2D6C8' : '#24504C',
  },
  typography,
  spacing,
  borderRadius,
  shadows: {
    sm: createShadow(mode, 1, 2, { light: 0.05, dark: 0.3 }, 1),
    md: createShadow(mode, 2, 4, { light: 0.07, dark: 0.4 }, 3),
    lg: createShadow(mode, 4, 8, { light: 0.1, dark: 0.5 }, 6),
  },
});

export type Theme = ReturnType<typeof createTheme>;

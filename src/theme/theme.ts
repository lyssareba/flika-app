import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export type ThemeMode = 'light' | 'dark';

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
    border: mode === 'light' ? '#E0E0E0' : '#3A3A50',
  },
  typography,
  spacing,
  borderRadius,
  shadows: {
    sm:
      mode === 'light'
        ? '0px 1px 2px rgba(0, 0, 0, 0.05)'
        : '0px 1px 2px rgba(0, 0, 0, 0.3)',
    md:
      mode === 'light'
        ? '0px 4px 6px rgba(0, 0, 0, 0.07)'
        : '0px 4px 6px rgba(0, 0, 0, 0.4)',
    lg:
      mode === 'light'
        ? '0px 10px 15px rgba(0, 0, 0, 0.1)'
        : '0px 10px 15px rgba(0, 0, 0, 0.5)',
  },
});

export type Theme = ReturnType<typeof createTheme>;

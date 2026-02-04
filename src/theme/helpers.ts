import { Theme } from './theme';

type ThemeGetter<T> = (props: { theme: Theme }) => T;

const SPACING_BASE = 8;

export const theme = {
  // Multiplier-based spacing: theme.spacing(1) = 8px, theme.spacing(2) = 16px
  spacing: (multiplier: number): ThemeGetter<string> =>
    () => `${multiplier * SPACING_BASE}px`,

  color: (key: keyof Theme['colors']): ThemeGetter<string> =>
    ({ theme }) => theme.colors[key],

  radius: (key: keyof Theme['borderRadius']): ThemeGetter<string> =>
    ({ theme }) => `${theme.borderRadius[key]}px`,

  fontSize: (key: keyof Theme['typography']['fontSize']): ThemeGetter<string> =>
    ({ theme }) => `${theme.typography.fontSize[key]}px`,

  shadow: (
    size: keyof Theme['shadows'],
    prop: keyof Theme['shadows']['sm']
  ): ThemeGetter<string | number> =>
    ({ theme }) => {
      const s = theme.shadows[size];
      if (prop === 'shadowOffset') {
        return `${s.shadowOffset.width}px ${s.shadowOffset.height}px`;
      }
      return s[prop];
    },
};

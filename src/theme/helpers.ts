import { Theme } from './theme';

type ThemeGetter<T> = (props: { theme: Theme }) => T;

// Spacing helper: ${spacing(4)} → padding with theme.spacing[4]
export const spacing = (key: keyof Theme['spacing']): ThemeGetter<string> =>
  ({ theme }) => `${theme.spacing[key]}px`;

// Color helper: ${color('primary')} → theme.colors.primary
export const color = (key: keyof Theme['colors']): ThemeGetter<string> =>
  ({ theme }) => theme.colors[key];

// Border radius helper: ${radius('lg')} → theme.borderRadius.lg
export const radius = (key: keyof Theme['borderRadius']): ThemeGetter<string> =>
  ({ theme }) => `${theme.borderRadius[key]}px`;

// Font size helper: ${fontSize('base')} → theme.typography.fontSize.base
export const fontSize = (
  key: keyof Theme['typography']['fontSize']
): ThemeGetter<string> => ({ theme }) => `${theme.typography.fontSize[key]}px`;

// Shadow helper for individual properties
export const shadow = (
  size: keyof Theme['shadows'],
  prop: keyof Theme['shadows']['sm']
): ThemeGetter<string | number> =>
  ({ theme }) => {
    const s = theme.shadows[size];
    if (prop === 'shadowOffset') {
      return `${s.shadowOffset.width}px ${s.shadowOffset.height}px`;
    }
    return s[prop];
  };

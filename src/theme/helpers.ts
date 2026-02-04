import { Theme } from './theme';

type ThemeGetter<T> = (props: { theme: Theme }) => T;

export const theme = {
  spacing: (key: keyof Theme['spacing']): ThemeGetter<string> =>
    ({ theme }) => `${theme.spacing[key]}px`,

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

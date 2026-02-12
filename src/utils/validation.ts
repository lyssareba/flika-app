import { MIN_PASSWORD_LENGTH } from '@/constants';

export const isNotEmpty = (value: string): boolean => value.trim().length > 0;

export const isValidPassword = (password: string): boolean =>
  password.length >= MIN_PASSWORD_LENGTH;

export const passwordsMatch = (a: string, b: string): boolean => a === b;

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

import styled from '@emotion/native';
import { Theme } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonContainerProps {
  theme: Theme;
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
}

const getBackgroundColor = (variant: ButtonVariant, theme: Theme): string => {
  switch (variant) {
    case 'primary':
      return theme.colors.primary;
    case 'secondary':
      return theme.colors.secondary;
    case 'outline':
    case 'ghost':
      return 'transparent';
  }
};

const getBorderStyle = (variant: ButtonVariant, theme: Theme) => {
  if (variant === 'outline') {
    return `2px solid ${theme.colors.primary}`;
  }
  return 'none';
};

const getPadding = (size: ButtonSize, theme: Theme) => {
  switch (size) {
    case 'sm':
      return `${theme.spacing[2]}px ${theme.spacing[3]}px`;
    case 'md':
      return `${theme.spacing[3]}px ${theme.spacing[4]}px`;
    case 'lg':
      return `${theme.spacing[4]}px ${theme.spacing[6]}px`;
  }
};

export const ButtonContainer = styled.TouchableOpacity<ButtonContainerProps>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background-color: ${({ variant, theme }) => getBackgroundColor(variant, theme)};
  padding: ${({ size, theme }) => getPadding(size, theme)};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  min-height: 44px;
  ${({ variant, theme }) =>
    variant === 'outline' ? `border: 2px solid ${theme.colors.primary};` : ''}
`;

interface ButtonTextProps {
  theme: Theme;
  variant: ButtonVariant;
  size: ButtonSize;
}

const getTextColor = (variant: ButtonVariant, theme: Theme): string => {
  switch (variant) {
    case 'primary':
    case 'secondary':
      return '#FFFFFF';
    case 'outline':
    case 'ghost':
      return theme.colors.primary;
  }
};

const getFontSize = (size: ButtonSize, theme: Theme): number => {
  switch (size) {
    case 'sm':
      return theme.typography.fontSize.sm;
    case 'md':
      return theme.typography.fontSize.base;
    case 'lg':
      return theme.typography.fontSize.lg;
  }
};

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${({ variant, theme }) => getTextColor(variant, theme)};
  font-size: ${({ size, theme }) => getFontSize(size, theme)}px;
  font-weight: 600;
`;

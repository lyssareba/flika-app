import styled from '@emotion/native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonContainerProps {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
}

export const ButtonContainer = styled.TouchableOpacity<ButtonContainerProps>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
    }
  }};
  padding: ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return `${theme.spacing[2]}px ${theme.spacing[3]}px`;
      case 'md':
        return `${theme.spacing[3]}px ${theme.spacing[4]}px`;
      case 'lg':
        return `${theme.spacing[4]}px ${theme.spacing[6]}px`;
    }
  }};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  min-height: 44px;
  ${({ variant, theme }) =>
    variant === 'outline' ? `border: 2px solid ${theme.colors.primary};` : ''}
`;

interface ButtonTextProps {
  variant: ButtonVariant;
  size: ButtonSize;
}

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
    }
  }};
  font-size: ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'md':
        return theme.typography.fontSize.base;
      case 'lg':
        return theme.typography.fontSize.lg;
    }
  }}px;
  font-weight: 600;
`;

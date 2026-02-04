import styled from '@emotion/native';
import { Theme, theme } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonContainerProps {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
}

const backgroundColors: Record<ButtonVariant, (theme: Theme) => string> = {
  primary: (theme) => theme.colors.primary,
  secondary: (theme) => theme.colors.secondary,
  outline: () => 'transparent',
  ghost: () => 'transparent',
};

const textColors: Record<ButtonVariant, (theme: Theme) => string> = {
  primary: () => '#FFFFFF',
  secondary: () => '#FFFFFF',
  outline: (theme) => theme.colors.primary,
  ghost: (theme) => theme.colors.primary,
};

const paddings: Record<ButtonSize, (theme: Theme) => string> = {
  sm: (theme) => `${theme.spacing[2]}px ${theme.spacing[3]}px`,
  md: (theme) => `${theme.spacing[3]}px ${theme.spacing[4]}px`,
  lg: (theme) => `${theme.spacing[4]}px ${theme.spacing[6]}px`,
};

const fontSizes: Record<ButtonSize, (theme: Theme) => number> = {
  sm: (theme) => theme.typography.fontSize.sm,
  md: (theme) => theme.typography.fontSize.base,
  lg: (theme) => theme.typography.fontSize.lg,
};

export const ButtonContainer = styled.TouchableOpacity<ButtonContainerProps>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.radius('lg')};
  background-color: ${({ variant, theme: t }) => backgroundColors[variant](t)};
  padding: ${({ size, theme: t }) => paddings[size](t)};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  min-height: 44px;
  ${({ variant }) => (variant === 'outline' ? `border-width: 2px;` : '')}
  ${({ variant }) => (variant === 'outline' ? `border-style: solid;` : '')}
  border-color: ${theme.color('primary')};
`;

interface ButtonTextProps {
  variant: ButtonVariant;
  size: ButtonSize;
}

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${({ variant, theme: t }) => textColors[variant](t)};
  font-size: ${({ size, theme: t }) => fontSizes[size](t)}px;
  font-weight: 600;
`;

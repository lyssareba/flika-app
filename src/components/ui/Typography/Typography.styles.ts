import styled from '@emotion/native';
import { Theme } from '@/theme';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

export type TypographyColor = 'primary' | 'secondary' | 'muted' | 'error';

const textColors: Record<TypographyColor, (theme: Theme) => string> = {
  primary: (theme) => theme.colors.textPrimary,
  secondary: (theme) => theme.colors.textSecondary,
  muted: (theme) => theme.colors.textMuted,
  error: (theme) => theme.colors.error,
};

interface TextProps {
  variant: TypographyVariant;
  color: TypographyColor;
  align?: 'left' | 'center' | 'right';
}

export const StyledText = styled.Text<TextProps>`
  color: ${({ color, theme }) => textColors[color](theme)};
  font-size: ${({ variant, theme }) => theme.typography.styles[variant].fontSize}px;
  font-weight: ${({ variant, theme }) => theme.typography.styles[variant].fontWeight};
  line-height: ${({ variant, theme }) =>
    theme.typography.styles[variant].fontSize *
    theme.typography.styles[variant].lineHeight}px;
  text-align: ${({ align }) => align || 'left'};
`;

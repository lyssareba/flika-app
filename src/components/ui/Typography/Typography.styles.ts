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

interface TextProps {
  theme: Theme;
  variant: TypographyVariant;
  color: TypographyColor;
  align?: 'left' | 'center' | 'right';
}

const getColor = (color: TypographyColor, theme: Theme): string => {
  switch (color) {
    case 'primary':
      return theme.colors.textPrimary;
    case 'secondary':
      return theme.colors.textSecondary;
    case 'muted':
      return theme.colors.textMuted;
    case 'error':
      return theme.colors.error;
  }
};

export const StyledText = styled.Text<TextProps>`
  color: ${({ color, theme }) => getColor(color, theme)};
  font-size: ${({ variant, theme }) => theme.typography.styles[variant].fontSize}px;
  font-weight: ${({ variant, theme }) => theme.typography.styles[variant].fontWeight};
  line-height: ${({ variant, theme }) =>
    theme.typography.styles[variant].fontSize *
    theme.typography.styles[variant].lineHeight}px;
  text-align: ${({ align }) => align || 'left'};
`;

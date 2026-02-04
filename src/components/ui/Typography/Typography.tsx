import React from 'react';
import { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/hooks';
import {
  StyledText,
  TypographyVariant,
  TypographyColor,
} from './Typography.styles';

interface TypographyProps extends Omit<RNTextProps, 'style'> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  children,
  style,
  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledText
      theme={theme}
      variant={variant}
      color={color}
      align={align}
      style={style}
      {...props}
    >
      {children}
    </StyledText>
  );
};

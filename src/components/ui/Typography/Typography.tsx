import React from 'react';
import { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
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
  return (
    <StyledText
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

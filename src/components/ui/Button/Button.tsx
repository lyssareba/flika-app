import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import {
  ButtonContainer,
  ButtonText,
  ButtonVariant,
  ButtonSize,
} from './Button.styles';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onPress,
  ...props
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
      {...props}
    >
      <ButtonText variant={variant} size={size}>
        {title}
      </ButtonText>
    </ButtonContainer>
  );
};

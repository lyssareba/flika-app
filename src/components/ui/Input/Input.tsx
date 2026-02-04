import React from 'react';
import { TextInputProps } from 'react-native';
import { useTheme } from '@/hooks';
import { Container, Label, StyledInput, ErrorText } from './Input.styles';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  placeholder?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  placeholder,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Container>
      {label && <Label>{label}</Label>}
      <StyledInput
        hasError={!!error}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel={label || placeholder}
        accessibilityHint={error}
        {...props}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

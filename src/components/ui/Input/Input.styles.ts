import styled from '@emotion/native';
import { sp, color, radius, fontSize } from '@/theme';

export const Container = styled.View`
  width: 100%;
`;

export const Label = styled.Text`
  color: ${color('textSecondary')};
  font-size: ${fontSize('sm')};
  font-weight: 500;
  margin-bottom: ${sp(1)};
`;

interface StyledInputProps {
  hasError?: boolean;
}

export const StyledInput = styled.TextInput<StyledInputProps>`
  background-color: ${color('backgroundCard')};
  border-width: 1px;
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${radius('md')};
  padding: ${sp(3)};
  font-size: ${fontSize('base')};
  color: ${color('textPrimary')};
  min-height: 48px;
`;

export const ErrorText = styled.Text`
  color: ${color('error')};
  font-size: ${fontSize('xs')};
  margin-top: ${sp(1)};
`;

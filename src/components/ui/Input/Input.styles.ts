import styled from '@emotion/native';
import { theme } from '@/theme';

export const Container = styled.View`
  width: 100%;
`;

export const Label = styled.Text`
  color: ${theme.color('textSecondary')};
  font-size: ${theme.fontSize('sm')};
  font-weight: 500;
  margin-bottom: ${theme.spacing(1)};
`;

interface StyledInputProps {
  hasError?: boolean;
}

export const StyledInput = styled.TextInput<StyledInputProps>`
  background-color: ${theme.color('backgroundCard')};
  border-width: 1px;
  border-color: ${({ theme: t, hasError }) =>
    hasError ? t.colors.error : t.colors.border};
  border-radius: ${theme.radius('md')};
  padding: ${theme.spacing(3)};
  font-size: ${theme.fontSize('base')};
  color: ${theme.color('textPrimary')};
  min-height: 48px;
`;

export const ErrorText = styled.Text`
  color: ${theme.color('error')};
  font-size: ${theme.fontSize('xs')};
  margin-top: ${theme.spacing(1)};
`;

import styled from '@emotion/native';
import { Theme } from '@/theme';

interface ContainerProps {
  theme: Theme;
}

export const Container = styled.View<ContainerProps>`
  width: 100%;
`;

interface LabelProps {
  theme: Theme;
}

export const Label = styled.Text<LabelProps>`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing[1]}px;
`;

interface StyledInputProps {
  theme: Theme;
  hasError?: boolean;
}

export const StyledInput = styled.TextInput<StyledInputProps>`
  background-color: ${({ theme }) => theme.colors.backgroundCard};
  border-width: 1px;
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing[3]}px;
  font-size: ${({ theme }) => theme.typography.fontSize.base}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 48px;
`;

interface ErrorTextProps {
  theme: Theme;
}

export const ErrorText = styled.Text<ErrorTextProps>`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
  margin-top: ${({ theme }) => theme.spacing[1]}px;
`;

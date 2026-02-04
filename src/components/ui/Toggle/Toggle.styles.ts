import styled from '@emotion/native';
import { Theme } from '@/theme';

interface ContainerProps {
  theme: Theme;
}

export const Container = styled.View<ContainerProps>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
`;

interface LabelProps {
  theme: Theme;
}

export const Label = styled.Text<LabelProps>`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.base}px;
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing[3]}px;
`;

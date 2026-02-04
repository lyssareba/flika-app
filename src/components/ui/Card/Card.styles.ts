import styled from '@emotion/native';
import { Theme } from '@/theme';

interface CardContainerProps {
  theme: Theme;
  elevated?: boolean;
}

export const CardContainer = styled.View<CardContainerProps>`
  background-color: ${({ theme, elevated }) =>
    elevated ? theme.colors.backgroundElevated : theme.colors.backgroundCard};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing[4]}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const PressableCardContainer = styled.TouchableOpacity<CardContainerProps>`
  background-color: ${({ theme, elevated }) =>
    elevated ? theme.colors.backgroundElevated : theme.colors.backgroundCard};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing[4]}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  min-height: 44px;
`;

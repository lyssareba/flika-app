import styled from '@emotion/native';

interface CardContainerProps {
  elevated?: boolean;
}

export const CardContainer = styled.View<CardContainerProps>`
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing[4]}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, elevated }) =>
    elevated ? theme.colors.backgroundElevated : theme.colors.backgroundCard};
`;

export const PressableCardContainer = styled.TouchableOpacity<CardContainerProps>`
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing[4]}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, elevated }) =>
    elevated ? theme.colors.backgroundElevated : theme.colors.backgroundCard};
  min-height: 44px;
`;

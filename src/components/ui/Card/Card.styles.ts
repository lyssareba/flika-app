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
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) =>
    `${theme.shadows.sm.shadowOffset.width}px ${theme.shadows.sm.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
`;

export const PressableCardContainer = styled.TouchableOpacity<CardContainerProps>`
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing[4]}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, elevated }) =>
    elevated ? theme.colors.backgroundElevated : theme.colors.backgroundCard};
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) =>
    `${theme.shadows.sm.shadowOffset.width}px ${theme.shadows.sm.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
  min-height: 44px;
`;

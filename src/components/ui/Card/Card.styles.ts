import styled from '@emotion/native';
import { theme } from '@/theme';

interface CardContainerProps {
  elevated?: boolean;
}

export const CardContainer = styled.View<CardContainerProps>`
  border-radius: ${theme.radius('lg')};
  padding: ${theme.spacing(2)};
  border-width: 1px;
  border-color: ${theme.color('border')};
  background-color: ${({ theme: t, elevated }) =>
    elevated ? t.colors.backgroundElevated : t.colors.backgroundCard};
  shadow-color: ${theme.shadow('sm', 'shadowColor')};
  shadow-offset: ${theme.shadow('sm', 'shadowOffset')};
  shadow-opacity: ${theme.shadow('sm', 'shadowOpacity')};
  shadow-radius: ${theme.shadow('sm', 'shadowRadius')}px;
  elevation: ${theme.shadow('sm', 'elevation')};
`;

export const PressableCardContainer = styled.TouchableOpacity<CardContainerProps>`
  border-radius: ${theme.radius('lg')};
  padding: ${theme.spacing(2)};
  border-width: 1px;
  border-color: ${theme.color('border')};
  background-color: ${({ theme: t, elevated }) =>
    elevated ? t.colors.backgroundElevated : t.colors.backgroundCard};
  shadow-color: ${theme.shadow('sm', 'shadowColor')};
  shadow-offset: ${theme.shadow('sm', 'shadowOffset')};
  shadow-opacity: ${theme.shadow('sm', 'shadowOpacity')};
  shadow-radius: ${theme.shadow('sm', 'shadowRadius')}px;
  elevation: ${theme.shadow('sm', 'elevation')};
  min-height: 44px;
`;

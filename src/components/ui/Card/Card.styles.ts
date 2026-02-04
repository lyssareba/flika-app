import styled from '@emotion/native';
import { sp, color, radius, shadow } from '@/theme';

interface CardContainerProps {
  elevated?: boolean;
}

export const CardContainer = styled.View<CardContainerProps>`
  border-radius: ${radius('lg')};
  padding: ${sp(4)};
  border-width: 1px;
  border-color: ${color('border')};
  background-color: ${({ theme, elevated }) =>
    elevated ? theme.colors.backgroundElevated : theme.colors.backgroundCard};
  shadow-color: ${shadow('sm', 'shadowColor')};
  shadow-offset: ${shadow('sm', 'shadowOffset')};
  shadow-opacity: ${shadow('sm', 'shadowOpacity')};
  shadow-radius: ${shadow('sm', 'shadowRadius')}px;
  elevation: ${shadow('sm', 'elevation')};
`;

export const PressableCardContainer = styled.TouchableOpacity<CardContainerProps>`
  border-radius: ${radius('lg')};
  padding: ${sp(4)};
  border-width: 1px;
  border-color: ${color('border')};
  background-color: ${({ theme, elevated }) =>
    elevated ? theme.colors.backgroundElevated : theme.colors.backgroundCard};
  shadow-color: ${shadow('sm', 'shadowColor')};
  shadow-offset: ${shadow('sm', 'shadowOffset')};
  shadow-opacity: ${shadow('sm', 'shadowOpacity')};
  shadow-radius: ${shadow('sm', 'shadowRadius')}px;
  elevation: ${shadow('sm', 'elevation')};
  min-height: 44px;
`;

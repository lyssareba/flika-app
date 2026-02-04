import React from 'react';
import { View } from 'react-native';
import styled from '@emotion/native';
import { theme } from '@/theme';
import { Typography } from '@/components/ui';

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing(4)};
  padding-top: ${theme.spacing(6)};
  background-color: ${theme.color('background')};
`;

const TitleContainer = styled.View`
  flex: 1;
`;

const ActionButton = styled.TouchableOpacity`
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
`;

interface HeaderProps {
  title: string;
  leftAction?: {
    label: string;
    onPress: () => void;
  };
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftAction,
  rightAction,
}) => {
  return (
    <HeaderContainer>
      {leftAction ? (
        <ActionButton
          onPress={leftAction.onPress}
          accessibilityRole="button"
          accessibilityLabel={leftAction.label}
        >
          <Typography variant="body" color="primary">
            {leftAction.label}
          </Typography>
        </ActionButton>
      ) : (
        <View style={{ minWidth: 44 }} />
      )}

      <TitleContainer>
        <Typography variant="h3" align="center">
          {title}
        </Typography>
      </TitleContainer>

      {rightAction ? (
        <ActionButton
          onPress={rightAction.onPress}
          accessibilityRole="button"
          accessibilityLabel={rightAction.label}
        >
          <Typography variant="body" color="primary">
            {rightAction.label}
          </Typography>
        </ActionButton>
      ) : (
        <View style={{ minWidth: 44 }} />
      )}
    </HeaderContainer>
  );
};

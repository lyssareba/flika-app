import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@/hooks';
import { Typography } from '@/components/ui';
import { Theme } from '@/theme';

interface HeaderContainerProps {
  theme: Theme;
}

const HeaderContainer = styled.View<HeaderContainerProps>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]}px;
  padding-top: ${({ theme }) => theme.spacing[6]}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TitleContainer = styled.View`
  flex: 1;
`;

const ActionButton = styled.TouchableOpacity<{ theme: Theme }>`
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
  const theme = useTheme();

  return (
    <HeaderContainer theme={theme}>
      {leftAction ? (
        <ActionButton
          theme={theme}
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
          theme={theme}
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

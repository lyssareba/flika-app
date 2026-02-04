import React from 'react';
import { useTheme } from '@/hooks';
import { CardContainer, PressableCardContainer } from './Card.styles';

interface CardProps {
  elevated?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  children,
  onPress,
}) => {
  const theme = useTheme();

  if (onPress) {
    return (
      <PressableCardContainer
        elevated={elevated}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        style={theme.shadows.sm}
      >
        {children}
      </PressableCardContainer>
    );
  }

  return (
    <CardContainer elevated={elevated} style={theme.shadows.sm}>
      {children}
    </CardContainer>
  );
};

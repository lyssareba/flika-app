import React from 'react';
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
  if (onPress) {
    return (
      <PressableCardContainer
        elevated={elevated}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {children}
      </PressableCardContainer>
    );
  }

  return <CardContainer elevated={elevated}>{children}</CardContainer>;
};

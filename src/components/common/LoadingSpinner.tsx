import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import { sp } from '@/theme';
import { useTheme } from '@/hooks';
import { Typography } from '@/components/ui';

interface ContainerProps {
  fullScreen?: boolean;
}

const Container = styled.View<ContainerProps>`
  ${({ fullScreen }) => (fullScreen ? 'flex: 1;' : '')}
  align-items: center;
  justify-content: center;
  padding: ${sp(6)};
`;

const MessageText = styled(Typography)`
  margin-top: ${sp(3)};
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
  fullScreen = false,
}) => {
  const { colors } = useTheme();

  return (
    <Container
      fullScreen={fullScreen}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
    >
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <MessageText variant="bodySmall" color="secondary">
          {message}
        </MessageText>
      )}
    </Container>
  );
};

import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@/hooks';
import { Typography } from '@/components/ui';

interface ContainerProps {
  fullScreen?: boolean;
}

const Container = styled.View<ContainerProps>`
  ${({ fullScreen }) => (fullScreen ? 'flex: 1;' : '')}
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[6]}px;
`;

const MessageText = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing[3]}px;
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

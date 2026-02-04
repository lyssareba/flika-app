import React from 'react';
import styled from '@emotion/native';
import { useTheme } from '@/hooks';
import { Typography, Button } from '@/components/ui';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[6]}px;
`;

const IconContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing[4]}px;
`;

const MessageContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing[4]}px;
`;

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const theme = useTheme();

  return (
    <Container>
      {icon && <IconContainer>{icon}</IconContainer>}

      <MessageContainer>
        <Typography variant="h3" align="center">
          {title}
        </Typography>
        {message && (
          <Typography
            variant="body"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing[2] }}
          >
            {message}
          </Typography>
        )}
      </MessageContainer>

      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </Container>
  );
};

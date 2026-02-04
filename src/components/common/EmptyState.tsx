import React from 'react';
import styled from '@emotion/native';
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

const MessageText = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing[2]}px;
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
  return (
    <Container>
      {icon && <IconContainer>{icon}</IconContainer>}

      <MessageContainer>
        <Typography variant="h3" align="center">
          {title}
        </Typography>
        {message && (
          <MessageText variant="body" color="secondary" align="center">
            {message}
          </MessageText>
        )}
      </MessageContainer>

      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </Container>
  );
};

import styled from '@emotion/native';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
`;

export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.base}px;
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing[3]}px;
`;

import styled from '@emotion/native';
import { theme } from '@/theme';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
`;

export const Label = styled.Text`
  color: ${theme.color('textPrimary')};
  font-size: ${theme.fontSize('base')};
  flex: 1;
  margin-right: ${theme.spacing(3)};
`;

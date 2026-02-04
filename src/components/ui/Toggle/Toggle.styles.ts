import styled from '@emotion/native';
import { sp, color, fontSize } from '@/theme';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
`;

export const Label = styled.Text`
  color: ${color('textPrimary')};
  font-size: ${fontSize('base')};
  flex: 1;
  margin-right: ${sp(3)};
`;

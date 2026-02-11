import React from 'react';
import { type ViewStyle } from 'react-native';
import { FlikaMascot } from './FlikaMascot';

interface FlikaCelebrationProps {
  size?: number;
  style?: ViewStyle;
  testID?: string;
}

export const FlikaCelebration = ({
  size = 120,
  style,
  testID,
}: FlikaCelebrationProps) => (
  <FlikaMascot
    state="celebrating"
    size={size}
    accessibilityLabel="Flika mascot celebrating"
    style={style}
    testID={testID}
  />
);

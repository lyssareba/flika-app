import React from 'react';
import { type ViewStyle } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { useThemeContext } from '@/theme';
import {
  type MascotState,
  type MascotStateConfig,
  type EyeVariant,
  type MouthVariant,
  type Accessory,
  STATE_CONFIGS,
} from './FlikaStates';

interface FlikaMascotProps {
  state?: MascotState;
  size?: number;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

const BODY_PATH =
  'M50 8 C50 8, 28 25, 22 50 C16 75, 30 92, 50 92 C70 92, 84 75, 78 50 C72 25, 50 8, 50 8 Z';

const INNER_PATH =
  'M50 28 C50 28, 38 38, 35 52 C32 66, 38 78, 50 78 C62 78, 68 66, 65 52 C62 38, 50 28, 50 28 Z';

const renderGlow = (config: MascotStateConfig, isDark: boolean) => {
  const opacity = isDark ? config.glowOpacity * 1.5 : config.glowOpacity;
  if (opacity <= 0) return null;

  return (
    <Path
      d="M50 2 C50 2, 22 22, 14 52 C6 82, 24 98, 50 98 C76 98, 94 82, 86 52 C78 22, 50 2, 50 2 Z"
      fill={config.bodyFill}
      opacity={opacity}
    />
  );
};

const renderEyes = (variant: EyeVariant) => {
  switch (variant) {
    case 'happy':
      return (
        <G>
          <Path d="M37 52 Q40 48, 43 52" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M57 52 Q60 48, 63 52" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </G>
      );
    case 'closed':
      return (
        <G>
          <Path d="M36 52 L44 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <Path d="M56 52 L64 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </G>
      );
    case 'wide':
      return (
        <G>
          <Circle cx="40" cy="50" r="4" fill="#FFFFFF" />
          <Circle cx="40" cy="50" r="2" fill="#2A1F18" />
          <Circle cx="60" cy="50" r="4" fill="#FFFFFF" />
          <Circle cx="60" cy="50" r="2" fill="#2A1F18" />
        </G>
      );
    case 'sparkle':
      return (
        <G>
          <Circle cx="40" cy="50" r="3.5" fill="#FFFFFF" />
          <Circle cx="40" cy="49" r="1.5" fill="#2A1F18" />
          <Circle cx="41.5" cy="48" r="1" fill="#FFFFFF" />
          <Circle cx="60" cy="50" r="3.5" fill="#FFFFFF" />
          <Circle cx="60" cy="49" r="1.5" fill="#2A1F18" />
          <Circle cx="61.5" cy="48" r="1" fill="#FFFFFF" />
        </G>
      );
    case 'normal':
    default:
      return (
        <G>
          <Circle cx="40" cy="50" r="3" fill="#FFFFFF" />
          <Circle cx="40" cy="50" r="1.5" fill="#2A1F18" />
          <Circle cx="60" cy="50" r="3" fill="#FFFFFF" />
          <Circle cx="60" cy="50" r="1.5" fill="#2A1F18" />
        </G>
      );
  }
};

const renderMouth = (variant: MouthVariant) => {
  switch (variant) {
    case 'smile':
      return (
        <Path
          d="M43 62 Q50 68, 57 62"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'open':
      return (
        <Path
          d="M44 62 Q50 70, 56 62 Z"
          fill="#FFFFFF"
          opacity={0.9}
        />
      );
    case 'small':
      return (
        <Path
          d="M46 63 Q50 65, 54 63"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'grin':
      return (
        <Path
          d="M40 60 Q50 72, 60 60"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'neutral':
    default:
      return (
        <Path
          d="M45 63 L55 63"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
  }
};

const renderAccessory = (accessory: Accessory) => {
  switch (accessory) {
    case 'sparkles':
      return (
        <G>
          <SvgText x="18" y="22" fontSize="10" fill="#FFD93D">*</SvgText>
          <SvgText x="78" y="18" fontSize="8" fill="#FFD93D">*</SvgText>
          <SvgText x="82" y="40" fontSize="12" fill="#FFE58F">*</SvgText>
          <SvgText x="12" y="45" fontSize="9" fill="#FFE58F">*</SvgText>
        </G>
      );
    case 'eyebrow':
      return (
        <G>
          <Path
            d="M55 40 Q60 36, 66 39"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'question':
      return (
        <SvgText
          x="76"
          y="30"
          fontSize="16"
          fontWeight="bold"
          fill="#FFFFFF"
          opacity={0.8}
        >
          ?
        </SvgText>
      );
    case 'zzz':
      return (
        <G>
          <SvgText x="68" y="30" fontSize="10" fontWeight="bold" fill="#FFFFFF" opacity={0.5}>z</SvgText>
          <SvgText x="75" y="22" fontSize="8" fontWeight="bold" fill="#FFFFFF" opacity={0.4}>z</SvgText>
          <SvgText x="80" y="16" fontSize="6" fontWeight="bold" fill="#FFFFFF" opacity={0.3}>z</SvgText>
        </G>
      );
    default:
      return null;
  }
};

export const FlikaMascot = ({
  state = 'idle',
  size = 80,
  accessibilityLabel,
  style,
  testID,
}: FlikaMascotProps) => {
  const { theme } = useThemeContext();
  const isDark = theme.mode === 'dark';
  const config = STATE_CONFIGS[state];

  const bodyTransform =
    config.bodyScale !== 1.0 || config.bodyRotation !== 0
      ? `scale(${config.bodyScale}) rotate(${config.bodyRotation}, 50, 50)`
      : undefined;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? `Flika mascot, ${state} state`}
      accessibilityRole="image"
    >
      {renderGlow(config, isDark)}

      <G transform={bodyTransform}>
        <Path d={BODY_PATH} fill={config.bodyFill} />
        <Path d={INNER_PATH} fill={config.innerFill} opacity={0.6} />
        {renderEyes(config.eyeVariant)}
        {renderMouth(config.mouthVariant)}
      </G>

      {renderAccessory(config.accessory)}
    </Svg>
  );
};

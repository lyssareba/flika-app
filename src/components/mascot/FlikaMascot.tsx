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

const OUTLINE = '#5A2100';
const FACE_COLOR = '#4A1E0A';
const BLUSH = '#F0A070';

// Main body — rounded blob narrowing into a flame tip at top
const BODY_PATH =
  'M50 14 C57 22, 72 34, 78 48 C83 58, 80 66, 72 74 C66 79, 58 82, 50 82 C42 82, 34 79, 28 74 C20 66, 17 58, 22 48 C28 34, 43 22, 50 14 Z';

// Inner lighter area — belly/face region inside the body
const INNER_PATH =
  'M50 32 C55 38, 64 44, 67 54 C70 62, 67 70, 61 74 C56 77, 44 77, 39 74 C33 70, 30 62, 33 54 C36 44, 45 38, 50 32 Z';

// Glow — enlarged body silhouette
const GLOW_PATH =
  'M50 8 C58 18, 78 30, 85 46 C91 58, 87 72, 78 80 C70 87, 60 90, 50 90 C40 90, 30 87, 22 80 C13 72, 9 58, 15 46 C22 30, 42 18, 50 8 Z';

// Stubby legs
const LEFT_LEG = 'M38 78 C36 84, 37 90, 40 90 C43 90, 44 84, 42 78 Z';
const RIGHT_LEG = 'M58 78 C56 84, 57 90, 60 90 C63 90, 64 84, 62 78 Z';

const renderGlow = (config: MascotStateConfig, isDark: boolean) => {
  const opacity = isDark ? config.glowOpacity * 1.5 : config.glowOpacity;
  if (opacity <= 0) return null;
  return <Path d={GLOW_PATH} fill={config.bodyFill} opacity={opacity} />;
};

const renderEyes = (variant: EyeVariant) => {
  // Left eye at (39, 56), right eye at (61, 56)
  switch (variant) {
    case 'happy':
      return (
        <G>
          <Path d="M34 57 Q39 51, 44 57" stroke={FACE_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M56 57 Q61 51, 66 57" stroke={FACE_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </G>
      );
    case 'closed':
      return (
        <G>
          <Path d="M35 56 L43 56" stroke={FACE_COLOR} strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M57 56 L65 56" stroke={FACE_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        </G>
      );
    case 'wide':
      return (
        <G>
          <Circle cx="39" cy="56" r="6.5" fill="#FFFFFF" />
          <Circle cx="39" cy="56" r="5" fill={FACE_COLOR} />
          <Circle cx="37" cy="54" r="2" fill="#FFFFFF" />
          <Circle cx="61" cy="56" r="6.5" fill="#FFFFFF" />
          <Circle cx="61" cy="56" r="5" fill={FACE_COLOR} />
          <Circle cx="59" cy="54" r="2" fill="#FFFFFF" />
        </G>
      );
    case 'sparkle':
      return (
        <G>
          <Circle cx="39" cy="56" r="5.5" fill="#FFFFFF" />
          <Circle cx="39" cy="56" r="4.5" fill={FACE_COLOR} />
          <Circle cx="37" cy="54" r="2" fill="#FFFFFF" />
          <Circle cx="40.5" cy="57.5" r="1" fill="#FFFFFF" />
          <Circle cx="61" cy="56" r="5.5" fill="#FFFFFF" />
          <Circle cx="61" cy="56" r="4.5" fill={FACE_COLOR} />
          <Circle cx="59" cy="54" r="2" fill="#FFFFFF" />
          <Circle cx="62.5" cy="57.5" r="1" fill="#FFFFFF" />
        </G>
      );
    case 'normal':
    default:
      return (
        <G>
          <Circle cx="39" cy="56" r="5.5" fill="#FFFFFF" />
          <Circle cx="39" cy="56" r="4.5" fill={FACE_COLOR} />
          <Circle cx="37" cy="54" r="1.5" fill="#FFFFFF" />
          <Circle cx="61" cy="56" r="5.5" fill="#FFFFFF" />
          <Circle cx="61" cy="56" r="4.5" fill={FACE_COLOR} />
          <Circle cx="59" cy="54" r="1.5" fill="#FFFFFF" />
        </G>
      );
  }
};

const renderMouth = (variant: MouthVariant) => {
  switch (variant) {
    case 'smile':
      return (
        <Path
          d="M44 66 Q50 72, 56 66"
          stroke={FACE_COLOR}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'open':
      return (
        <Path
          d="M46 65 Q50 72, 54 65 Q50 63, 46 65 Z"
          fill={FACE_COLOR}
        />
      );
    case 'small':
      return (
        <Path
          d="M47 67 Q50 69, 53 67"
          stroke={FACE_COLOR}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'grin':
      return (
        <Path
          d="M41 64 Q50 74, 59 64"
          stroke={FACE_COLOR}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'neutral':
    default:
      return (
        <Path
          d="M46 67 Q50 69, 54 67"
          stroke={FACE_COLOR}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
};

const renderCheeks = () => (
  <G>
    <Circle cx="30" cy="62" r="4.5" fill={BLUSH} opacity={0.3} />
    <Circle cx="70" cy="62" r="4.5" fill={BLUSH} opacity={0.3} />
  </G>
);

const renderAccessory = (accessory: Accessory) => {
  switch (accessory) {
    case 'sparkles':
      return (
        <G>
          <Path d="M10 18 L12 14 L14 18 L12 22 Z" fill="#FFD93D" />
          <Path d="M88 12 L90 9 L92 12 L90 15 Z" fill="#FFE58F" />
          <Path d="M92 40 L95 36 L98 40 L95 44 Z" fill="#FFD93D" />
          <Circle cx="6" cy="44" r="2" fill="#FFE58F" />
        </G>
      );
    case 'eyebrow':
      return (
        <Path
          d="M57 46 Q63 42, 69 45"
          stroke={FACE_COLOR}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'question':
      return (
        <SvgText
          x="80"
          y="26"
          fontSize="16"
          fontWeight="bold"
          fill={OUTLINE}
          opacity={0.7}
        >
          ?
        </SvgText>
      );
    case 'zzz':
      return (
        <G>
          <SvgText x="70" y="26" fontSize="11" fontWeight="bold" fill={OUTLINE} opacity={0.5}>z</SvgText>
          <SvgText x="78" y="18" fontSize="9" fontWeight="bold" fill={OUTLINE} opacity={0.4}>z</SvgText>
          <SvgText x="84" y="12" fontSize="7" fontWeight="bold" fill={OUTLINE} opacity={0.3}>z</SvgText>
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

  const needsTransform = config.bodyScale !== 1.0 || config.bodyRotation !== 0;
  const bodyTransform = needsTransform
    ? `translate(50, 50) scale(${config.bodyScale}) rotate(${config.bodyRotation}) translate(-50, -50)`
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
        {/* Legs — behind body */}
        <Path d={LEFT_LEG} fill={config.bodyFill} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        <Path d={RIGHT_LEG} fill={config.bodyFill} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />

        {/* Main body */}
        <Path d={BODY_PATH} fill={config.bodyFill} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />

        {/* Inner highlight — belly/face area */}
        <Path d={INNER_PATH} fill={config.innerFill} opacity={0.85} />

        {/* Cheeks */}
        {renderCheeks()}

        {/* Face */}
        {renderEyes(config.eyeVariant)}
        {renderMouth(config.mouthVariant)}
      </G>

      {renderAccessory(config.accessory)}
    </Svg>
  );
};

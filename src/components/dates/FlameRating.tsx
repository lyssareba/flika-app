import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks';

// Flame colors from ember (low/left) to blaze (high/right)
const FLAME_COLORS = [
  '#FF9800', // Ember - deep orange
  '#FF7043', // Warming
  '#FF5722', // Hot
  '#F44336', // Blazing
  '#D32F2F', // Blaze - deep red
];

const UNSELECTED_COLOR_LIGHT = '#E0E0E0';
const UNSELECTED_COLOR_DARK = '#4A4A5A';

interface FlameRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  displayOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

interface Dimensions {
  bubble: number;
  icon: number;
  gap: number;
}

export const FlameRating: React.FC<FlameRatingProps> = ({
  value,
  onChange,
  displayOnly = false,
  size = 'md',
}) => {
  const theme = useTheme();

  const dimensions = useMemo((): Dimensions => {
    switch (size) {
      case 'xs':
        return { bubble: 20, icon: 12, gap: 4 };
      case 'sm':
        return { bubble: 28, icon: 16, gap: 6 };
      case 'lg':
        return { bubble: 44, icon: 28, gap: 12 };
      case 'md':
      default:
        return { bubble: 36, icon: 22, gap: 8 };
    }
  }, [size]);

  const styles = useMemo(
    () => createStyles(theme.mode, dimensions),
    [theme.mode, dimensions]
  );

  const unselectedColor =
    theme.mode === 'light' ? UNSELECTED_COLOR_LIGHT : UNSELECTED_COLOR_DARK;

  const handlePress = (rating: number) => {
    if (!displayOnly && onChange) {
      // Tap same rating to clear it
      if (value === rating) {
        onChange(0);
      } else {
        onChange(rating);
      }
    }
  };

  const accessibilityProps = displayOnly
    ? {
        accessibilityRole: 'text' as AccessibilityRole,
        accessibilityLabel: value
          ? `Rating: ${value} out of 5 flames`
          : 'No rating',
      }
    : {
        accessibilityRole: 'adjustable' as AccessibilityRole,
        accessibilityLabel: value
          ? `Rating: ${value} out of 5 flames`
          : 'No rating selected',
        accessibilityHint: 'Tap a flame to set rating',
        accessibilityValue: {
          min: 0,
          max: 5,
          now: value || 0,
        },
      };

  const renderBubble = (index: number) => {
    const rating = index + 1;
    const isSelected = value !== undefined && rating <= value;
    const flameColor = FLAME_COLORS[index];

    const bubbleStyle = [
      styles.bubble,
      isSelected
        ? {
            backgroundColor: flameColor,
            borderColor: flameColor,
          }
        : styles.bubbleUnselected,
    ];

    const iconColor = isSelected ? '#FFFFFF' : unselectedColor;

    const bubble = (
      <View style={bubbleStyle}>
        <Ionicons name="flame" size={dimensions.icon} color={iconColor} />
      </View>
    );

    if (displayOnly) {
      return <View key={index}>{bubble}</View>;
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handlePress(rating)}
        activeOpacity={0.7}
        accessibilityLabel={`${rating} flame${rating === 1 ? '' : 's'}`}
      >
        {bubble}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} {...accessibilityProps}>
      {[0, 1, 2, 3, 4].map(renderBubble)}
    </View>
  );
};

const createStyles = (mode: 'light' | 'dark', dimensions: Dimensions) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: dimensions.gap,
    },
    bubble: {
      width: dimensions.bubble,
      height: dimensions.bubble,
      borderRadius: dimensions.bubble / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    bubbleUnselected: {
      borderColor:
        mode === 'light' ? UNSELECTED_COLOR_LIGHT : UNSELECTED_COLOR_DARK,
      backgroundColor: 'transparent',
    },
  });

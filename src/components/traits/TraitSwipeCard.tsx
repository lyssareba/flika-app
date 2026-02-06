import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { Trait, TraitState } from '@/types';

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 300;
const MAX_SWIPE_DISTANCE = 120;
const ROTATION_FACTOR = 0.08;

interface TraitSwipeCardProps {
  trait: Trait;
  onStateChange: (traitId: string, state: TraitState) => void;
}

export const TraitSwipeCard: React.FC<TraitSwipeCardProps> = ({
  trait,
  onStateChange,
}) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const translateX = useSharedValue(0);
  const hasTriggered = useSharedValue(false);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleStateChange = useCallback(
    (newState: TraitState) => {
      onStateChange(trait.id, newState);
    },
    [trait.id, onStateChange]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Clamp translation to max swipe distance
      translateX.value = Math.max(
        -MAX_SWIPE_DISTANCE,
        Math.min(MAX_SWIPE_DISTANCE, event.translationX)
      );

      // Check if threshold crossed for haptic feedback
      const triggered =
        Math.abs(translateX.value) >= SWIPE_THRESHOLD && !hasTriggered.value;
      if (triggered) {
        hasTriggered.value = true;
        runOnJS(triggerHaptic)();
      } else if (Math.abs(translateX.value) < SWIPE_THRESHOLD) {
        hasTriggered.value = false;
      }
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const triggered =
        Math.abs(translationX) >= SWIPE_THRESHOLD ||
        Math.abs(velocityX) >= VELOCITY_THRESHOLD;

      if (triggered) {
        const newState: TraitState = translationX > 0 ? 'yes' : 'no';
        runOnJS(handleStateChange)(newState);
      }

      // Snap back
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      hasTriggered.value = false;
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (trait.state !== 'unknown') {
      runOnJS(handleStateChange)('unknown');
      runOnJS(triggerHaptic)();
    }
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotation = translateX.value * ROTATION_FACTOR;

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [-MAX_SWIPE_DISTANCE, 0, MAX_SWIPE_DISTANCE],
      [
        theme.colors.traitNo + '40',
        theme.colors.backgroundCard,
        theme.colors.traitYes + '40',
      ]
    );

    return {
      backgroundColor,
    };
  });

  const leftLabelOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-MAX_SWIPE_DISTANCE, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.5, 0]
    ),
  }));

  const rightLabelOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, MAX_SWIPE_DISTANCE],
      [0, 0.5, 1]
    ),
  }));

  const sliderPosition = useAnimatedStyle(() => {
    const position = interpolate(
      translateX.value,
      [-MAX_SWIPE_DISTANCE, 0, MAX_SWIPE_DISTANCE],
      [0, 50, 100]
    );

    return {
      left: `${position}%`,
      marginLeft: -8, // Half of indicator width
    };
  });

  const isDealbreaker = trait.attributeCategory === 'dealbreaker';

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.cardWrapper, animatedBackgroundStyle]}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Trait Name */}
          <View style={styles.traitHeader}>
            <Text style={styles.traitName}>
              {trait.attributeName}
              {isDealbreaker && <Text style={styles.dealbreaker}> ★</Text>}
            </Text>
          </View>

          {/* Swipe Labels */}
          <View style={styles.labelsContainer}>
            <Animated.View style={[styles.labelLeft, leftLabelOpacity]}>
              <Text style={styles.labelTextNo}>{t('No')}</Text>
            </Animated.View>
            <Text style={styles.labelCenter}>?</Text>
            <Animated.View style={[styles.labelRight, rightLabelOpacity]}>
              <Text style={styles.labelTextYes}>{t('Yes')}</Text>
            </Animated.View>
          </View>

          {/* Slider Track */}
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderSection, styles.sliderNo]} />
            <View style={[styles.sliderSection, styles.sliderUnknown]} />
            <View style={[styles.sliderSection, styles.sliderYes]} />
            <Animated.View style={[styles.sliderIndicator, sliderPosition]} />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    cardWrapper: {
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      overflow: 'hidden',
    },
    card: {
      padding: 20,
      alignItems: 'center',
    },
    traitHeader: {
      marginBottom: 16,
    },
    traitName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    dealbreaker: {
      color: theme.colors.warning,
    },
    labelsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 12,
    },
    labelLeft: {
      flex: 1,
      alignItems: 'flex-start',
    },
    labelRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    labelCenter: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.textMuted,
      fontWeight: '300',
    },
    labelTextNo: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.traitNoText,
    },
    labelTextYes: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.traitYesText,
    },
    sliderTrack: {
      flexDirection: 'row',
      height: 8,
      width: '100%',
      borderRadius: 4,
      overflow: 'hidden',
      position: 'relative',
    },
    sliderSection: {
      flex: 1,
    },
    sliderNo: {
      backgroundColor: theme.colors.traitNo,
    },
    sliderUnknown: {
      backgroundColor: theme.colors.traitUnknown,
    },
    sliderYes: {
      backgroundColor: theme.colors.traitYes,
    },
    sliderIndicator: {
      position: 'absolute',
      top: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.textPrimary,
      borderWidth: 2,
      borderColor: theme.colors.backgroundCard,
    },
  });

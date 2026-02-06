import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '@/hooks';
import { TraitLongPressMenu } from './TraitLongPressMenu';
import type { Trait, TraitState } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = SCREEN_WIDTH * 0.4;

interface TraitSwipeRowProps {
  trait: Trait;
  onStateChange: (traitId: string, state: TraitState) => void;
}

export const TraitSwipeRow: React.FC<TraitSwipeRowProps> = ({
  trait,
  onStateChange,
}) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const reduceMotion = useReduceMotion();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const translateX = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleStateChange = useCallback(
    (newState: TraitState) => {
      onStateChange(trait.id, newState);
    },
    [trait.id, onStateChange]
  );

  const handleResetToUnknown = useCallback(() => {
    if (trait.state !== 'unknown') {
      triggerHaptic();
      onStateChange(trait.id, 'unknown');
    }
  }, [trait.id, trait.state, onStateChange, triggerHaptic]);

  const openMenu = useCallback(() => {
    setMenuVisible(true);
    triggerHaptic();
  }, [triggerHaptic]);

  const handleMenuSelect = useCallback(
    (state: TraitState) => {
      if (trait.state !== state) {
        triggerHaptic();
        onStateChange(trait.id, state);
      }
    },
    [trait.id, trait.state, onStateChange, triggerHaptic]
  );

  const handleAccessibilityAction = useCallback(
    (actionName: string) => {
      switch (actionName) {
        case 'activate':
          openMenu();
          break;
        case 'increment':
          handleStateChange('yes');
          break;
        case 'decrement':
          handleStateChange('no');
          break;
      }
    },
    [openMenu, handleStateChange]
  );

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleResetToUnknown)();
  });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      runOnJS(openMenu)();
    });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Clamp translation with resistance at edges
      const clampedX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, event.translationX));
      translateX.value = clampedX;

      // Haptic feedback when crossing threshold
      const crossedThreshold = Math.abs(clampedX) >= SWIPE_THRESHOLD;
      if (crossedThreshold && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerHaptic)();
      } else if (!crossedThreshold) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd((event) => {
      const { translationX } = event;

      if (Math.abs(translationX) >= SWIPE_THRESHOLD) {
        const newState: TraitState = translationX > 0 ? 'yes' : 'no';
        runOnJS(handleStateChange)(newState);
      }

      // Snap back smoothly - respect reduce motion preference
      if (reduceMotion) {
        translateX.value = withTiming(0, { duration: 0 });
      } else {
        translateX.value = withSpring(0, {
          damping: 25,
          stiffness: 200,
          overshootClamping: true,
        });
      }
      hasTriggeredHaptic.value = false;
    });

  const composedGesture = Gesture.Race(panGesture, Gesture.Exclusive(longPressGesture, tapGesture));

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const isDealbreaker = trait.attributeCategory === 'dealbreaker';

  const getStateLabel = (): string => {
    switch (trait.state) {
      case 'yes':
        return t('Yes');
      case 'no':
        return t('No');
      default:
        return t('Unknown');
    }
  };

  const getStateIndicator = () => {
    switch (trait.state) {
      case 'yes':
        return (
          <View style={[styles.stateIndicator, styles.stateYes]}>
            <Ionicons name="checkmark" size={14} color={theme.colors.traitYesText} />
          </View>
        );
      case 'no':
        return (
          <View style={[styles.stateIndicator, styles.stateNo]}>
            <Ionicons name="close" size={14} color={theme.colors.traitNoText} />
          </View>
        );
      default:
        return (
          <View style={[styles.stateIndicator, styles.stateUnknown]}>
            <Text style={styles.stateUnknownText}>?</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Background actions */}
      <View style={styles.actionsContainer}>
        {/* Left action (Yes) */}
        <Animated.View style={[styles.actionLeft, leftActionStyle]}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.actionText}>{t('Yes')}</Text>
        </Animated.View>

        {/* Right action (No) */}
        <Animated.View style={[styles.actionRight, rightActionStyle]}>
          <Text style={styles.actionText}>{t('No')}</Text>
          <Ionicons name="close-circle" size={24} color="#fff" />
        </Animated.View>
      </View>

      {/* Swipeable row */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[styles.row, rowStyle]}
          accessibilityRole="button"
          accessibilityLabel={`${trait.attributeName}, ${getStateLabel()}`}
          accessibilityHint={t('Swipe right for yes, left for no, or double tap for options')}
          accessibilityActions={[
            { name: 'activate', label: 'Open options' },
            { name: 'increment', label: 'Set to yes' },
            { name: 'decrement', label: 'Set to no' },
          ]}
          onAccessibilityAction={(event: AccessibilityActionEvent) =>
            handleAccessibilityAction(event.nativeEvent.actionName)
          }
        >
          <View style={styles.rowContent}>
            <Text style={styles.traitName}>
              {trait.attributeName}
              {isDealbreaker && <Text style={styles.dealbreaker}> ★</Text>}
            </Text>
            {getStateIndicator()}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Long press menu */}
      <TraitLongPressMenu
        visible={menuVisible}
        trait={trait}
        onSelect={handleMenuSelect}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 4,
      overflow: 'hidden',
    },
    actionsContainer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
    },
    actionLeft: {
      flex: 1,
      backgroundColor: theme.colors.success,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 20,
      gap: 8,
    },
    actionRight: {
      flex: 1,
      backgroundColor: theme.colors.error,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 20,
      gap: 8,
    },
    actionText: {
      color: '#fff',
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
    },
    row: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 4,
    },
    rowContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    traitName: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    dealbreaker: {
      color: theme.colors.warning,
    },
    stateIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stateYes: {
      backgroundColor: theme.colors.traitYes,
    },
    stateNo: {
      backgroundColor: theme.colors.traitNo,
    },
    stateUnknown: {
      backgroundColor: theme.colors.traitUnknown,
    },
    stateUnknownText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.traitUnknownText,
      fontWeight: '600',
    },
  });

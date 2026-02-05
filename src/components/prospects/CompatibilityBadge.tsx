import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface CompatibilityBadgeProps {
  score: number | null; // null means "still learning"
  size?: 'small' | 'medium' | 'large';
}

/**
 * Displays a compatibility score with color coding.
 * - Green (75-100): Looking great
 * - Yellow (50-74): Still getting to know
 * - Orange (25-49): Some things to consider
 * - Red (0-24): Might not be the best fit
 * - Gray (null): Still learning...
 */
export const CompatibilityBadge = ({ score, size = 'medium' }: CompatibilityBadgeProps) => {
  const { t } = useTranslation('prospect');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme, size), [theme, size]);

  const { color, label } = useMemo(() => {
    if (score === null) {
      return {
        color: theme.colors.textMuted,
        label: t('Still learning...'),
      };
    }

    if (score >= 75) {
      return {
        color: theme.colors.success,
        label: `${score}% ${t('compatible')}`,
      };
    }

    if (score >= 50) {
      return {
        color: theme.colors.warning,
        label: `${score}% ${t('compatible')}`,
      };
    }

    if (score >= 25) {
      return {
        color: '#FF9800', // Orange
        label: `${score}% ${t('compatible')}`,
      };
    }

    return {
      color: theme.colors.error,
      label: `${score}% ${t('compatible')}`,
    };
  }, [score, theme.colors, t]);

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const createStyles = (theme: Theme, size: 'small' | 'medium' | 'large') => {
  const fontSize = {
    small: theme.typography.fontSize.xs,
    medium: theme.typography.fontSize.sm,
    large: theme.typography.fontSize.base,
  }[size];

  const dotSize = {
    small: 6,
    medium: 8,
    large: 10,
  }[size];

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
    },
    text: {
      fontSize,
      fontWeight: '500',
    },
  });
};

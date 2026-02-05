import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface DealbreakersWarningProps {
  count: number;
  compact?: boolean;
}

/**
 * Warning badge showing count of dealbreaker traits marked "No".
 */
export const DealbreakersWarning = ({ count, compact = false }: DealbreakersWarningProps) => {
  const { t } = useTranslation('prospect');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme, compact), [theme, compact]);

  if (count === 0) {
    return null;
  }

  const label = count === 1
    ? t('{{count}} dealbreaker confirmed "No"', { count })
    : t('{{count}} dealbreakers confirmed "No"', { count });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="warning" size={14} color={theme.colors.warning} />
        <Text style={styles.compactText}>{count}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="warning" size={16} color={theme.colors.warning} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const createStyles = (theme: Theme, compact: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.traitNo,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    text: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.traitNoText,
      fontWeight: '500',
    },
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    compactText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.warning,
      fontWeight: '600',
    },
  });

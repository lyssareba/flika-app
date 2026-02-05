import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  onAddPress: () => void;
}

/**
 * Empty state shown when user has no prospects yet.
 */
export const EmptyState = ({ onAddPress }: EmptyStateProps) => {
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="heart-outline" size={64} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>No prospects yet</Text>
      <Text style={styles.subtitle}>
        Start tracking someone you&apos;re interested in
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onAddPress}
        accessibilityRole="button"
        accessibilityLabel={t('Add Someone New')}
      >
        <Ionicons name="add" size={20} color={theme.colors.textOnPrimary} />
        <Text style={styles.buttonText}>{t('Add Someone New')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    iconContainer: {
      marginBottom: 24,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    buttonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  });

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';

interface PlanOptionProps {
  title: string;
  price: string;
  pricePerMonth: string;
  badge?: string;
  savings?: string;
  selected: boolean;
  onSelect: () => void;
}

export const PlanOption = ({
  title,
  price,
  pricePerMonth,
  badge,
  savings,
  selected,
  onSelect,
}: PlanOptionProps) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={24}
        color={selected ? theme.colors.primary : theme.colors.textMuted}
      />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          {pricePerMonth}
          {savings ? ` · ${savings}` : ''}
        </Text>
      </View>
      <Text style={styles.price}>{price}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
    },
    containerSelected: {
      borderColor: theme.colors.primary,
    },
    content: {
      flex: 1,
      gap: 2,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    title: {
      ...theme.typography.styles.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    badge: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing[2],
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    badgeText: {
      ...theme.typography.styles.caption,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    subtitle: {
      ...theme.typography.styles.caption,
      color: theme.colors.textSecondary,
    },
    price: {
      ...theme.typography.styles.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
  });

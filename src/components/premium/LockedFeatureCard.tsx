import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type RelativePathString } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';

// Route will be created in issue #102
const PAYWALL_ROUTE = '/paywall' as RelativePathString;

interface LockedFeatureCardProps {
  feature: string;
  description?: string;
  compact?: boolean;
  onUpgrade?: () => void;
}

export const LockedFeatureCard = ({
  feature,
  description,
  compact = false,
  onUpgrade,
}: LockedFeatureCardProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('premium');
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme, compact), [theme, compact]);

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push(PAYWALL_ROUTE);
    }
  };

  if (compact) {
    return (
      <View style={styles.container}>
        <Ionicons
          name="lock-closed"
          size={16}
          color={theme.colors.textMuted}
        />
        <Text style={styles.featureName} numberOfLines={1}>
          {feature}
        </Text>
        <TouchableOpacity
          onPress={handleUpgrade}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.upgradeText}>{t('Upgrade to Premium')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="lock-closed"
        size={24}
        color={theme.colors.textMuted}
      />
      <Text style={styles.featureName}>{feature}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      <TouchableOpacity
        onPress={handleUpgrade}
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.upgradeText}>{t('Upgrade to Premium')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme, compact: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: compact ? 'row' : 'column',
      alignItems: compact ? 'center' : 'center',
      gap: compact ? theme.spacing[2] : theme.spacing[3],
      padding: theme.spacing[4],
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.backgroundCard,
    },
    featureName: {
      ...theme.typography.styles.label,
      color: theme.colors.textPrimary,
      flex: compact ? 1 : undefined,
    },
    description: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    upgradeText: {
      ...theme.typography.styles.label,
      color: theme.colors.primary,
    },
  });

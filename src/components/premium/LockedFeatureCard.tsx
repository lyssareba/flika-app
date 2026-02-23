import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type RelativePathString } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';

// Route will be created in issue #102
const PAYWALL_ROUTE = '/paywall' as RelativePathString;

interface LockedFeatureCardProps {
  /** i18n key (looked up in the premium namespace) or pre-translated display string */
  feature: string;
  /** i18n key or pre-translated description */
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

  const featureLabel = t(feature, { defaultValue: feature });
  const descriptionLabel = description
    ? t(description, { defaultValue: description })
    : undefined;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push(PAYWALL_ROUTE);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="lock-closed"
        size={compact ? 16 : 24}
        color={theme.colors.textMuted}
      />
      <Text style={styles.featureName} numberOfLines={compact ? 1 : undefined}>
        {featureLabel}
      </Text>
      {!compact && descriptionLabel && (
        <Text style={styles.description}>{descriptionLabel}</Text>
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
      alignItems: 'center',
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

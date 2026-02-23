import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type RelativePathString } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';
import { usePremium } from '@/context/PremiumContext';

// Route will be created in issue #102
const PAYWALL_ROUTE = '/paywall' as RelativePathString;

interface UpgradeBannerProps {
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const UpgradeBanner = ({
  message,
  dismissible = false,
  onDismiss,
}: UpgradeBannerProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('premium');
  const { isPremium } = usePremium();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
      <Text style={styles.message}>
        {message ?? t('Unlock all features with Premium')}
      </Text>
      <TouchableOpacity
        onPress={() => router.push(PAYWALL_ROUTE)}
        accessibilityRole="link"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.upgradeLink}>{t('Upgrade')}</Text>
      </TouchableOpacity>
      {dismissible && (
        <TouchableOpacity
          onPress={onDismiss}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.primaryLight + '1A',
    },
    message: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    upgradeLink: {
      ...theme.typography.styles.label,
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });

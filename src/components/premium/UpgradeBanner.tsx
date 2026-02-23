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
          accessibilityLabel={t('common:Dismiss')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

/** Convert a hex color (#RGB or #RRGGBB) to rgba with the given opacity (0–1). */
const hexToRgba = (hex: string, opacity: number): string => {
  const shorthand = /^#([a-f\d])([a-f\d])([a-f\d])$/i;
  const full = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  if (!result) return hex;
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`;
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
      backgroundColor: hexToRgba(theme.colors.primaryLight, 0.1),
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

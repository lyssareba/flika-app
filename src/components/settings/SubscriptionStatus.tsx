import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useThemeContext, type Theme } from '@/theme';
import { usePremium } from '@/context/PremiumContext';
import { useAuth } from '@/hooks';
import { purchasesService } from '@/services/purchases';
import { RC_ENTITLEMENTS } from '@/constants/purchases';

export const SubscriptionStatus = () => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('premium');
  const router = useRouter();
  const { isPremium, isEarlyAdopter, customerInfo } = usePremium();
  const { userProfile } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [managementURL, setManagementURL] = useState<string | null>(null);

  useEffect(() => {
    if (isPremium && !isEarlyAdopter) {
      purchasesService.getManagementURL().then(setManagementURL).catch(() => {});
    } else {
      setManagementURL(null);
    }
  }, [isPremium, isEarlyAdopter]);

  const handleManageSubscription = useCallback(() => {
    if (managementURL) {
      Linking.openURL(managementURL);
    }
  }, [managementURL]);

  // Early Adopter state
  if (isEarlyAdopter) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={[styles.badge, styles.badgeEarlyAdopter]}>
            <Text style={[styles.badgeText, styles.badgeTextEarlyAdopter]}>
              {t('subscription.earlyAdopter')}
            </Text>
          </View>
        </View>
        <Text style={styles.label}>{t('subscription.lifetimePremium')}</Text>
        <Text style={styles.description}>
          {t('subscription.earlyAdopterDescription')}
        </Text>
        {userProfile?.earlyAdopterSlot != null && (
          <Text style={styles.slotText}>
            {t('subscription.earlyAdopterSlot', { slot: userProfile.earlyAdopterSlot })}
          </Text>
        )}
      </View>
    );
  }

  // Free Plan state
  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{t('subscription.freePlan')}</Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/paywall')}
          accessibilityRole="button"
        >
          <Text style={styles.upgradeButtonText}>
            {t('Upgrade to Premium')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Premium Active state
  const premiumEntitlement =
    customerInfo?.entitlements.active[RC_ENTITLEMENTS.PREMIUM];

  const getRenewalText = () => {
    if (!premiumEntitlement) return null;

    if (premiumEntitlement.expirationDate == null) {
      return t('subscription.lifetimeAccess');
    }

    const dateStr = new Date(premiumEntitlement.expirationDate).toLocaleDateString();

    if (premiumEntitlement.willRenew) {
      return t('subscription.renewsOn', { date: dateStr });
    }

    return t('subscription.expiresOn', { date: dateStr });
  };

  const renewalText = getRenewalText();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.badge, styles.badgePremium]}>
          <Text style={[styles.badgeText, styles.badgeTextPremium]}>
            {t('subscription.premiumActive')}
          </Text>
        </View>
      </View>
      {renewalText && <Text style={styles.description}>{renewalText}</Text>}
      {managementURL && (
        <TouchableOpacity
          onPress={handleManageSubscription}
          accessibilityRole="link"
        >
          <Text style={styles.manageLink}>
            {t('subscription.manageSubscription')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeEarlyAdopter: {
      backgroundColor: theme.colors.accent,
    },
    badgeText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
    },
    badgeTextEarlyAdopter: {
      color: theme.colors.textOnPrimary,
    },
    badgePremium: {
      backgroundColor: theme.colors.primary,
    },
    badgeTextPremium: {
      color: theme.colors.textOnPrimary,
    },
    label: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    slotText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    upgradeButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    upgradeButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
    manageLink: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
      marginTop: 8,
    },
  });

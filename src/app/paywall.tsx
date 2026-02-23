import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { type PurchasesPackage } from 'react-native-purchases';
import { useThemeContext, type Theme } from '@/theme';
import { usePremium } from '@/context/PremiumContext';
import { RC_PRODUCTS } from '@/constants/purchases';
import { getPurchaseErrorMessage } from '@/utils/purchaseErrors';
import { PAYWALL_MESSAGES } from '@/config/paywallMessages';
import { FlikaMascot } from '@/components/mascot';
import { FeatureList } from '@/components/premium/FeatureList';
import { PlanOption } from '@/components/premium/PlanOption';

const PREMIUM_FEATURES = [
  'paywall.feature.unlimitedProspects',
  'paywall.feature.compatibilityBreakdown',
  'paywall.feature.unlimitedDates',
  'paywall.feature.dataExport',
  'paywall.feature.cloudSync',
  'paywall.feature.prioritySupport',
];

interface PackageDetails {
  title: string;
  price: string;
  pricePerMonth: string;
  badge?: string;
  savings?: string;
  identifier: string;
}

const getPackageDetails = (
  pkg: PurchasesPackage,
  t: (key: string) => string
): PackageDetails | null => {
  const id = pkg.product.identifier;
  const priceString = pkg.product.priceString;

  if (id === RC_PRODUCTS.ANNUAL) {
    const monthlyPrice = pkg.product.price / 12;
    return {
      title: t('paywall.plan.annual'),
      price: `${priceString}/${t('paywall.plan.yr')}`,
      pricePerMonth: `${pkg.product.currencyCode} ${monthlyPrice.toFixed(2)}/${t('paywall.plan.mo')}`,
      badge: t('paywall.plan.bestValue'),
      savings: t('paywall.plan.save50'),
      identifier: pkg.identifier,
    };
  }

  if (id === RC_PRODUCTS.MONTHLY) {
    return {
      title: t('paywall.plan.monthly'),
      price: `${priceString}/${t('paywall.plan.mo')}`,
      pricePerMonth: `${priceString}/${t('paywall.plan.mo')}`,
      identifier: pkg.identifier,
    };
  }

  if (id === RC_PRODUCTS.LIFETIME) {
    return {
      title: t('paywall.plan.lifetime'),
      price: priceString,
      pricePerMonth: t('paywall.plan.oneTime'),
      identifier: pkg.identifier,
    };
  }

  return null;
};

const FALLBACK_PLANS: PackageDetails[] = [
  {
    title: 'Annual',
    price: '---',
    pricePerMonth: '---',
    badge: 'BEST VALUE',
    identifier: '$rc_annual',
  },
  {
    title: 'Monthly',
    price: '---',
    pricePerMonth: '---',
    identifier: '$rc_monthly',
  },
];

const PaywallScreen = () => {
  const router = useRouter();
  const { feature } = useLocalSearchParams<{ feature?: string }>();
  const { theme } = useThemeContext();
  const { t } = useTranslation('premium');
  const { t: tc } = useTranslation('common');
  const { offerings, purchase, restore } = usePremium();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const messages = PAYWALL_MESSAGES[feature ?? 'default'] ?? PAYWALL_MESSAGES.default;

  const plans = useMemo(() => {
    if (!offerings?.availablePackages?.length) {
      return FALLBACK_PLANS;
    }

    return offerings.availablePackages
      .map((pkg) => getPackageDetails(pkg, t))
      .filter((p): p is PackageDetails => p !== null);
  }, [offerings, t]);

  // Pre-select annual plan
  const effectiveSelection = selectedPlan ?? plans.find(
    (p) => p.identifier === '$rc_annual'
  )?.identifier ?? plans[0]?.identifier ?? null;

  const handlePurchase = useCallback(async () => {
    if (!effectiveSelection || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const success = await purchase(effectiveSelection);
      if (success) {
        router.back();
      }
    } catch (error) {
      Alert.alert(
        t('paywall.alert.purchaseFailedTitle'),
        getPurchaseErrorMessage(error as Parameters<typeof getPurchaseErrorMessage>[0])
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [effectiveSelection, isPurchasing, purchase, router, t]);

  const handleRestore = useCallback(async () => {
    if (isRestoring) return;

    setIsRestoring(true);
    try {
      const success = await restore();
      if (success) {
        Alert.alert(t('paywall.alert.restoredTitle'), t('paywall.alert.restoredMessage'), [
          { text: tc('OK'), onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          t('paywall.alert.noPurchasesTitle'),
          t('paywall.alert.noPurchasesMessage')
        );
      }
    } catch {
      Alert.alert(
        t('paywall.alert.restoreFailedTitle'),
        t('paywall.alert.restoreFailedMessage')
      );
    } finally {
      setIsRestoring(false);
    }
  }, [isRestoring, restore, router, t, tc]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel={tc('Close')}
        >
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mascot */}
        <View style={styles.mascotContainer}>
          <FlikaMascot state="celebrating" size={80} />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>{t(messages.titleKey)}</Text>
        <Text style={styles.subtitle}>{t(messages.subtitleKey)}</Text>

        {/* Feature List */}
        <View style={styles.featuresSection}>
          <FeatureList features={PREMIUM_FEATURES} />
        </View>

        {/* Plan Options */}
        <View style={styles.plansSection}>
          {plans.map((plan) => (
            <PlanOption
              key={plan.identifier}
              title={plan.title}
              price={plan.price}
              pricePerMonth={plan.pricePerMonth}
              badge={plan.badge}
              savings={plan.savings}
              selected={effectiveSelection === plan.identifier}
              onSelect={() => setSelectedPlan(plan.identifier)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            (isPurchasing || !effectiveSelection) && styles.ctaButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isPurchasing || !effectiveSelection}
          accessibilityRole="button"
          accessibilityLabel={t('paywall.cta')}
          accessibilityState={{ disabled: isPurchasing || !effectiveSelection }}
        >
          {isPurchasing ? (
            <ActivityIndicator color={theme.colors.textOnPrimary} />
          ) : (
            <Text style={styles.ctaButtonText}>{t('paywall.cta')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={isRestoring}
          style={styles.restoreButton}
          accessibilityRole="button"
        >
          <Text style={styles.restoreText}>
            {isRestoring ? t('paywall.restoring') : t('paywall.restore')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>{t('paywall.legal')}</Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
    },
    closeButton: {
      padding: theme.spacing[2],
      marginLeft: -theme.spacing[2],
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerSpacer: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[4],
    },
    mascotContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    title: {
      ...theme.typography.styles.h2,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing[1],
    },
    subtitle: {
      ...theme.typography.styles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing[6],
    },
    featuresSection: {
      marginBottom: theme.spacing[6],
    },
    plansSection: {
      gap: theme.spacing[3],
    },
    footer: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[3],
      paddingBottom: theme.spacing[2],
      borderTopWidth: 1,
      borderTopColor: theme.colors.backgroundCard,
    },
    ctaButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing[4],
      alignItems: 'center',
    },
    ctaButtonDisabled: {
      opacity: 0.5,
    },
    ctaButtonText: {
      ...theme.typography.styles.body,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
    restoreButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing[3],
    },
    restoreText: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.textMuted,
    },
    legalText: {
      ...theme.typography.styles.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });

export default PaywallScreen;

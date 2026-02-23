import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';
import { FlikaMascot } from '@/components/mascot';
import { FeatureList } from '@/components/premium/FeatureList';
import { EARLY_ADOPTER_MAX_SLOTS } from '@/constants';

const PREMIUM_FEATURES = [
  'paywall.feature.unlimitedProspects',
  'paywall.feature.compatibilityBreakdown',
  'paywall.feature.unlimitedDates',
  'paywall.feature.dataExport',
  'paywall.feature.cloudSync',
  'paywall.feature.prioritySupport',
];

interface EarlyAdopterStepProps {
  slotNumber: number;
  onNext: () => void;
}

export const EarlyAdopterStep = ({ slotNumber, onNext }: EarlyAdopterStepProps) => {
  const { t } = useTranslation('onboarding');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mascotContainer}>
          <FlikaMascot state="celebrating" size={100} />
        </View>

        <Text style={styles.title}>{t('earlyAdopter.title')}</Text>

        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>
            {t('earlyAdopter.slotBadge', {
              slot: slotNumber,
              total: EARLY_ADOPTER_MAX_SLOTS,
            })}
          </Text>
        </View>

        <Text style={styles.description}>{t('earlyAdopter.description')}</Text>

        <View style={styles.featuresSection}>
          <FeatureList features={PREMIUM_FEATURES} />
        </View>

        <Text style={styles.warmMessage}>{t('earlyAdopter.warmMessage')}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNext}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{t('earlyAdopter.cta')}</Text>
        </TouchableOpacity>
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 32,
      paddingTop: 24,
      paddingBottom: 16,
      alignItems: 'center',
    },
    mascotContainer: {
      marginBottom: 24,
    },
    title: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 16,
    },
    slotBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 8,
      marginBottom: 20,
    },
    slotBadgeText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '700',
    },
    description: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: 24,
    },
    featuresSection: {
      alignSelf: 'stretch',
      marginBottom: 24,
    },
    warmMessage: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 22,
    },
    footer: {
      paddingHorizontal: 32,
      paddingBottom: 24,
      paddingTop: 12,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
    },
  });

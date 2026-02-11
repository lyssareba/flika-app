import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { FlikaMascot } from '@/components/mascot';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const { t } = useTranslation('onboarding');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlikaMascot state="happy" size={100} accessibilityLabel="Flika mascot" />
        <Text style={styles.title}>{t('Welcome')}</Text>
        <Text style={styles.tagline}>
          {t("Your dating companion that helps you find what you're really looking for.")}
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNext}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{t("Let's get started")}</Text>
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
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    title: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 24,
    },
    tagline: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 26,
    },
    footer: {
      paddingHorizontal: 32,
      paddingBottom: 24,
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

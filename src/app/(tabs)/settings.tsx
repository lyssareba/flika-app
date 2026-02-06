import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';
import { useAuth } from '@/hooks';
import { updateUserSettings } from '@/services/firebase/firestore';
import { Toggle } from '@/components/ui';

const SettingsScreen = () => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('settings');
  const { user, userProfile, refreshProfile } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Local state for optimistic updates
  const [checkboxView, setCheckboxView] = useState(
    userProfile?.settings?.useCheckboxView ?? false
  );

  // Sync local state when userProfile changes (e.g., on initial load)
  useEffect(() => {
    setCheckboxView(userProfile?.settings?.useCheckboxView ?? false);
  }, [userProfile?.settings?.useCheckboxView]);

  const handleCheckboxViewToggle = useCallback(
    async (value: boolean) => {
      if (!user) return;

      // Optimistic update - immediately reflect in UI
      setCheckboxView(value);

      try {
        await updateUserSettings(user.uid, { useCheckboxView: value });
        // Background refresh to sync state (non-blocking)
        refreshProfile();
      } catch (error) {
        // Revert on error
        setCheckboxView(!value);
        console.error('Failed to update setting:', error);
      }
    },
    [user, refreshProfile]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Settings')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Accessibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Accessibility')}</Text>
          <View style={styles.sectionContent}>
            <Toggle
              label={t('Use checkbox view instead of swipes')}
              value={checkboxView}
              onValueChange={handleCheckboxViewToggle}
            />
          </View>
        </View>
      </ScrollView>
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingVertical: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    sectionContent: {
      backgroundColor: theme.colors.backgroundCard,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });

export default SettingsScreen;

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext, type Theme } from '@/theme';
import { useAuth, useAppLock } from '@/hooks';
import { updateUserSettings } from '@/services/firebase/firestore';
import { gatherExportData, shareAccountExport } from '@/services/export';
import { Toggle } from '@/components/ui';
import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal';
import { type StrictnessLevel } from '@/utils/compatibility';

type ThemePreference = 'system' | 'light' | 'dark';

const THEME_OPTIONS: { value: ThemePreference; labelKey: string }[] = [
  { value: 'system', labelKey: 'System' },
  { value: 'light', labelKey: 'Light' },
  { value: 'dark', labelKey: 'Dark' },
];

const STRICTNESS_OPTIONS: {
  value: StrictnessLevel;
  labelKey: string;
  descKey: string;
}[] = [
  {
    value: 'noEffect',
    labelKey: 'No Effect',
    descKey: 'No Effect: "No" has same impact as "Yes"',
  },
  {
    value: 'gentle',
    labelKey: 'Gentle',
    descKey: 'Gentle: "No" has 1.5× impact',
  },
  {
    value: 'normal',
    labelKey: 'Normal',
    descKey: 'Normal: "No" has 2× impact',
  },
  {
    value: 'strict',
    labelKey: 'Strict',
    descKey: 'Strict: "No" has 2.5× impact',
  },
];

const TIMEOUT_OPTIONS = [1, 5, 10, 15];

const SettingsScreen = () => {
  const { theme, mode, setMode } = useThemeContext();
  const { t } = useTranslation('settings');
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const {
    isAppLockEnabled,
    isBiometricEnabled,
    isBiometricAvailable,
    enableAppLock,
    enableBiometric,
    updateTimeout,
    getLockTimeout,
    hasPinSet,
  } = useAppLock();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Local state for optimistic updates
  const [checkboxView, setCheckboxView] = useState(
    userProfile?.settings?.useCheckboxView ?? false
  );
  const [strictness, setStrictness] = useState<StrictnessLevel>(
    userProfile?.settings?.scoringStrictness ?? 'normal'
  );
  const strictnessRef = useRef(strictness);
  strictnessRef.current = strictness;
  const [appLockEnabled, setAppLockEnabled] = useState(isAppLockEnabled);
  const [biometricEnabled, setBiometricEnabled] = useState(isBiometricEnabled);
  const [lockTimeout, setLockTimeout] = useState(5);
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync local state when external state changes
  useEffect(() => {
    setCheckboxView(userProfile?.settings?.useCheckboxView ?? false);
  }, [userProfile?.settings?.useCheckboxView]);

  useEffect(() => {
    setStrictness(userProfile?.settings?.scoringStrictness ?? 'normal');
  }, [userProfile?.settings?.scoringStrictness]);

  useEffect(() => {
    setAppLockEnabled(isAppLockEnabled);
  }, [isAppLockEnabled]);

  useEffect(() => {
    setBiometricEnabled(isBiometricEnabled);
  }, [isBiometricEnabled]);

  useEffect(() => {
    getLockTimeout().then((timeout) => {
      if (timeout != null) setLockTimeout(timeout);
    });
  }, [getLockTimeout]);

  const handleCheckboxViewToggle = useCallback(
    async (value: boolean) => {
      if (!user) return;
      setCheckboxView(value);
      try {
        await updateUserSettings(user.uid, { useCheckboxView: value });
        refreshProfile();
      } catch {
        setCheckboxView(!value);
      }
    },
    [user, refreshProfile]
  );

  const handleStrictnessChange = useCallback(
    async (value: StrictnessLevel) => {
      if (!user) return;
      const prev = strictnessRef.current;
      setStrictness(value);
      try {
        await updateUserSettings(user.uid, { scoringStrictness: value });
        refreshProfile();
      } catch {
        setStrictness(prev);
      }
    },
    [user, refreshProfile]
  );

  const handleAppLockToggle = useCallback(
    async (value: boolean) => {
      if (value && !hasPinSet) {
        router.push('/onboarding/security');
        return;
      }
      const prev = appLockEnabled;
      setAppLockEnabled(value);
      try {
        await enableAppLock(value);
      } catch {
        setAppLockEnabled(prev);
      }
    },
    [hasPinSet, appLockEnabled, enableAppLock, router]
  );

  const handleBiometricToggle = useCallback(
    async (value: boolean) => {
      const prev = biometricEnabled;
      setBiometricEnabled(value);
      try {
        await enableBiometric(value);
      } catch {
        setBiometricEnabled(prev);
      }
    },
    [biometricEnabled, enableBiometric]
  );

  const handleTimeoutChange = useCallback(
    async (minutes: number) => {
      setLockTimeout(minutes);
      await updateTimeout(minutes);
    },
    [updateTimeout]
  );

  const handleSignOut = useCallback(() => {
    Alert.alert(t('Sign out of Flika'), t('Are you sure you want to sign out?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Sign Out'),
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }, [t, signOut]);

  const handleExportData = useCallback(async () => {
    if (!user || !userProfile) return;
    setExporting(true);
    try {
      const data = await gatherExportData(user.uid, userProfile);
      await shareAccountExport(data);
    } catch {
      Alert.alert(t('Export failed'), t('Could not export data. Please try again.'));
    } finally {
      setExporting(false);
    }
  }, [user, userProfile, t]);

  const handleComingSoon = useCallback(
    (messageKey: string) => {
      Alert.alert(t(messageKey));
    },
    [t]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Settings')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Manage Attributes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Manage Attributes')}</Text>
          <TouchableOpacity
            style={[styles.sectionContent, styles.actionRow]}
            onPress={() => router.push('/settings/attributes')}
          >
            <Text style={styles.actionRowText}>{t('Your Attributes')}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Scoring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Scoring')}</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>{t('Scoring Strictness')}</Text>
            <View style={styles.optionRow}>
              {STRICTNESS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    strictness === option.value && styles.optionChipSelected,
                  ]}
                  onPress={() => handleStrictnessChange(option.value)}
                >
                  <Text
                    style={[
                      styles.optionChipLabel,
                      strictness === option.value && styles.optionChipLabelSelected,
                    ]}
                  >
                    {t(option.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.settingDescription}>{t(STRICTNESS_OPTIONS.find((o) => o.value === strictness)?.descKey ?? '')}</Text>
          </View>
        </View>

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

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Notifications')}</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.comingSoonText}>
              {t('Notifications coming soon')}
            </Text>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Security')}</Text>
          <View style={styles.sectionContent}>
            <Toggle
              label={t('Enable app lock')}
              value={appLockEnabled}
              onValueChange={handleAppLockToggle}
            />
            {appLockEnabled && (
              <>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t('Lock after')}</Text>
                  <View style={styles.optionRow}>
                    {TIMEOUT_OPTIONS.map((minutes) => (
                      <TouchableOpacity
                        key={minutes}
                        style={[
                          styles.optionChip,
                          lockTimeout === minutes && styles.optionChipSelected,
                        ]}
                        onPress={() => handleTimeoutChange(minutes)}
                      >
                        <Text
                          style={[
                            styles.optionChipLabel,
                            lockTimeout === minutes && styles.optionChipLabelSelected,
                          ]}
                        >
                          {t('{{count}} minutes', { count: minutes })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {isBiometricAvailable && (
                  <Toggle
                    label={t('Use Biometrics')}
                    value={biometricEnabled}
                    onValueChange={handleBiometricToggle}
                  />
                )}
              </>
            )}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Appearance')}</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>{t('Theme')}</Text>
            <View style={styles.optionRow}>
              {THEME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    mode === option.value && styles.optionChipSelected,
                  ]}
                  onPress={() => setMode(option.value)}
                >
                  <Text
                    style={[
                      styles.optionChipLabel,
                      mode === option.value && styles.optionChipLabelSelected,
                    ]}
                  >
                    {t(option.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Data Management')}</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleExportData}
              disabled={exporting}
            >
              <Text style={[styles.actionRowText, exporting && styles.actionRowTextDisabled]}>
                {exporting ? t('Exporting...') : t('Export My Data')}
              </Text>
              {exporting ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textMuted}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text style={styles.actionRowDestructive}>{t('Delete Account')}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Account')}</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.emailText}>{userProfile?.email}</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.actionRowDestructive}>{t('Sign Out')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
      />
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
      paddingTop: 16,
      paddingBottom: 48,
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
    settingRow: {
      paddingVertical: 8,
    },
    settingLabel: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    settingDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    optionChipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    optionChipLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    optionChipLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    actionRowText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    actionRowTextDisabled: {
      color: theme.colors.textMuted,
    },
    actionRowDestructive: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.error,
    },
    comingSoonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      paddingVertical: 8,
    },
    emailText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      paddingVertical: 8,
    },
    signOutButton: {
      paddingVertical: 12,
    },
  });

export default SettingsScreen;

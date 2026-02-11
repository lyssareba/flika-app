import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks';
import { deleteAccount } from '@/services/firebase/deleteAccount';
import { gatherExportData, shareAccountExport } from '@/services/export';

interface DeleteAccountModalProps {
  visible: boolean;
  onCancel: () => void;
}

export const DeleteAccountModal = ({ visible, onCancel }: DeleteAccountModalProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const { user, userProfile } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetState = useCallback(() => {
    setStep(1);
    setPassword('');
    setError('');
    setLoading(false);
  }, []);

  const handleCancel = useCallback(() => {
    resetState();
    onCancel();
  }, [resetState, onCancel]);

  const handleExport = useCallback(async () => {
    if (!user || !userProfile) return;
    try {
      const data = await gatherExportData(user.uid, userProfile);
      await shareAccountExport(data);
    } catch {
      Alert.alert(t('Export failed'), t('Could not export data. Please try again.'));
    }
  }, [user, userProfile, t]);

  const handleDelete = useCallback(async () => {
    if (!user || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      await deleteAccount(user, password);
      // deleteUser triggers onAuthStateChanged(null) → AuthGate shows login
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError(t('Incorrect password. Please try again.'));
      } else {
        setError(t('Could not delete account. Please try again.'));
        Alert.alert(t('Delete Account'), t('Could not delete account. Please try again.'));
      }
      setLoading(false);
    }
  }, [user, password, t]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.overlay}
          onPress={handleCancel}
          disabled={loading}
        />
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            {step === 1 ? (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="warning" size={40} color={theme.colors.error} />
                </View>

                <Text style={styles.title}>{t('Delete Your Account?')}</Text>

                <Text style={styles.subtitle}>
                  {t('This will permanently delete:')}
                </Text>

                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <Text style={styles.bulletText}>
                      {t('Your profile and account')}
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <Text style={styles.bulletText}>
                      {t('All prospects and their data')}
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <Text style={styles.bulletText}>
                      {t('All date history')}
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <Text style={styles.bulletText}>
                      {t('All settings and preferences')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.warningText}>
                  {t('This action cannot be undone.')}
                </Text>

                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={handleExport}
                  accessibilityRole="button"
                >
                  <Text style={styles.exportButtonText}>
                    {t('Export My Data First')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setStep(2)}
                  accessibilityRole="button"
                >
                  <Text style={styles.deleteButtonText}>
                    {t('Delete Immediately')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelButtonText}>{tc('Cancel')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>{t('Confirm Deletion')}</Text>

                <Text style={styles.confirmSubtitle}>
                  {t('Enter your password to confirm account deletion')}
                </Text>

                <TextInput
                  style={[styles.passwordInput, error ? styles.passwordInputError : null]}
                  placeholder={t('Password')}
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError('');
                  }}
                  editable={!loading}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.error} />
                    <Text style={styles.loadingText}>
                      {t('Deleting your account...')}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.deleteButton, loading && styles.buttonDisabled]}
                  onPress={handleDelete}
                  disabled={loading || !password.trim()}
                  accessibilityRole="button"
                >
                  <Text style={styles.deleteButtonText}>
                    {t('Delete My Account')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelButton, loading && styles.buttonDisabled]}
                  onPress={() => {
                    setPassword('');
                    setError('');
                    setStep(1);
                  }}
                  disabled={loading}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelButtonText}>{t('Go Back')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      overflow: 'hidden',
    },
    content: {
      padding: 24,
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: 16,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      alignSelf: 'stretch',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    confirmSubtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    bulletList: {
      alignSelf: 'stretch',
      paddingHorizontal: 16,
      marginBottom: 16,
      gap: 6,
    },
    bulletItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    bullet: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    bulletText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      flex: 1,
    },
    warningText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.error,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 20,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignSelf: 'stretch',
      alignItems: 'center',
      marginBottom: 8,
    },
    deleteButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
    },
    exportButton: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignSelf: 'stretch',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    exportButtonText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
    },
    cancelButton: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignSelf: 'stretch',
      alignItems: 'center',
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
    },
    passwordInput: {
      alignSelf: 'stretch',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.backgroundCard,
      marginBottom: 12,
    },
    passwordInputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 12,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    loadingText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });

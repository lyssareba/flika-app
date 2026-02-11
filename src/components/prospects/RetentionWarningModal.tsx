import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface RetentionWarningModalProps {
  visible: boolean;
  prospectName: string;
  onRestore: () => void;
  onKeepInArchive: () => void;
  onClose: () => void;
}

export const RetentionWarningModal = ({
  visible,
  prospectName,
  onRestore,
  onKeepInArchive,
  onClose,
}: RetentionWarningModalProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={40} color={theme.colors.warning} />
            </View>

            <Text style={styles.title}>
              {t('{{name}} will be removed soon', { name: prospectName })}
            </Text>

            <Text style={styles.description}>
              {t(
                "This prospect's data will be automatically removed. Would you like to keep it?"
              )}
            </Text>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={onRestore}
              accessibilityRole="button"
            >
              <Text style={styles.restoreButtonText}>{t('Restore')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepButton}
              onPress={onKeepInArchive}
              accessibilityRole="button"
            >
              <Text style={styles.keepButtonText}>
                {t('Keep in Archive')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
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
    description: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 20,
    },
    restoreButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignSelf: 'stretch',
      alignItems: 'center',
      marginBottom: 8,
    },
    restoreButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
    },
    keepButton: {
      backgroundColor: theme.colors.backgroundCard,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignSelf: 'stretch',
      alignItems: 'center',
      marginBottom: 8,
    },
    keepButtonText: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
    },
    cancelButton: {
      padding: 8,
    },
  });

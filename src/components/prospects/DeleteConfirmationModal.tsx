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
import { useReduceMotion } from '@/hooks';

interface DeleteConfirmationModalProps {
  visible: boolean;
  prospectName: string;
  dateCount: number;
  evaluatedTraitCount: number;
  onDelete: () => void;
  onCancel: () => void;
  onExport?: () => void;
}

export const DeleteConfirmationModal = ({
  visible,
  prospectName,
  dateCount,
  evaluatedTraitCount,
  onDelete,
  onCancel,
  onExport,
}: DeleteConfirmationModalProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const reduceMotion = useReduceMotion();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'none' : 'fade'}
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <Pressable style={styles.overlay} onPress={onCancel} />
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={40} color={theme.colors.error} />
            </View>

            <Text style={styles.title}>
              {t('Delete {{name}}?', { name: prospectName })}
            </Text>

            <Text style={styles.subtitle}>
              {t('This will permanently delete')}{':'}
            </Text>

            <View style={styles.bulletList}>
              {dateCount > 0 && (
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>{'\u2022'}</Text>
                  <Text style={styles.bulletText}>
                    {t(dateCount === 1 ? '{{count}} date' : '{{count}} dates', {
                      count: dateCount,
                    })}
                  </Text>
                </View>
              )}
              {evaluatedTraitCount > 0 && (
                <View style={styles.bulletItem}>
                  <Text style={styles.bullet}>{'\u2022'}</Text>
                  <Text style={styles.bulletText}>
                    {t(
                      evaluatedTraitCount === 1
                        ? '{{count}} evaluated trait'
                        : '{{count}} evaluated traits',
                      { count: evaluatedTraitCount }
                    )}
                  </Text>
                </View>
              )}
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>{t('All notes and data')}</Text>
              </View>
            </View>

            <Text style={styles.warningText}>
              {t('This action cannot be undone.')}
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={t('Delete Permanently')}
            >
              <Text style={styles.deleteButtonText}>
                {t('Delete Permanently')}
              </Text>
            </TouchableOpacity>

            {onExport && (
              <TouchableOpacity
                style={styles.exportButton}
                onPress={onExport}
                accessibilityRole="button"
                accessibilityLabel={t('Export First')}
              >
                <Text style={styles.exportButtonText}>{t('Export First')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={tc('Cancel')}
            >
              <Text style={styles.cancelButtonText}>{tc('Cancel')}</Text>
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
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      alignSelf: 'stretch',
      paddingHorizontal: 16,
      marginBottom: 12,
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
  });

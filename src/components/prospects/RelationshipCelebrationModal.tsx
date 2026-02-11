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

interface RelationshipCelebrationModalProps {
  visible: boolean;
  prospectName: string;
  hasOtherActiveProspects: boolean;
  onArchiveOthers: () => void;
  onKeepOthers: () => void;
  onClose: () => void;
}

/**
 * Celebration modal shown when a prospect is moved to "In a Relationship" status.
 * Offers to archive other active prospects.
 */
export const RelationshipCelebrationModal = ({
  visible,
  prospectName,
  hasOtherActiveProspects,
  onArchiveOthers,
  onKeepOthers,
  onClose,
}: RelationshipCelebrationModalProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
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
          {/* TODO: Replace with mascot illustration */}
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={64} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>{t('Congratulations!')}</Text>

          {hasOtherActiveProspects ? (
            <>
              <Text style={styles.subtitle}>
                {t('Would you like to archive your other prospects?')}
              </Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onArchiveOthers}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryButtonText}>
                    {t('Archive others')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onKeepOthers}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryButtonText}>
                    {t('Keep them for now')}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onClose}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>{tc('Done')}</Text>
              </TouchableOpacity>
            </View>
          )}
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
      maxWidth: 340,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: 16,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    buttonsContainer: {
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.backgroundCard,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
  });

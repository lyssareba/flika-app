import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { ScoreBreakdown } from '@/types';

interface ScoreBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  breakdown: ScoreBreakdown[];
  overallScore: number;
  strictness: 'gentle' | 'normal' | 'strict';
}

const STRICTNESS_MULTIPLIERS: Record<string, string> = {
  gentle: '1.5',
  normal: '2',
  strict: '2.5',
};

/**
 * Modal explaining how the compatibility score is calculated.
 */
export const ScoreBreakdownModal = ({
  visible,
  onClose,
  breakdown,
  overallScore,
  strictness,
}: ScoreBreakdownModalProps) => {
  const router = useRouter();
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const multiplier = STRICTNESS_MULTIPLIERS[strictness];
  const strictnessLabel = t(`strictness_${strictness}`);

  const dealbreakersBreakdown = breakdown.find((b) => b.category === 'dealbreaker');
  const desiredBreakdown = breakdown.find((b) => b.category === 'desired');

  const handleGoToSettings = () => {
    onClose();
    router.push('/settings');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('Why this score?')}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={tc('Close')}
              >
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Overall Score */}
              <View style={styles.overallSection}>
                <Text style={styles.overallScore}>{overallScore}%</Text>
                <Text style={styles.overallLabel}>{t('compatible')}</Text>
              </View>

              {/* Dealbreakers Section */}
              {dealbreakersBreakdown && (
                <View style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{t('Dealbreakers')}</Text>
                    <Text style={styles.categoryWeight}>(60%)</Text>
                  </View>
                  <ProgressBar score={dealbreakersBreakdown.score} theme={theme} />
                  <View style={styles.categoryStats}>
                    <Text style={styles.statText}>
                      {t('{{confirmed}} of {{total}} confirmed', {
                        confirmed: dealbreakersBreakdown.confirmed,
                        total: dealbreakersBreakdown.total,
                      })}
                    </Text>
                    <View style={styles.yesNoStats}>
                      <View style={styles.statBadge}>
                        <Ionicons name="checkmark" size={14} color={theme.colors.success} />
                        <Text style={[styles.statBadgeText, { color: theme.colors.success }]}>
                          {dealbreakersBreakdown.yesCount}
                        </Text>
                      </View>
                      <View style={styles.statBadge}>
                        <Ionicons name="close" size={14} color={theme.colors.error} />
                        <Text style={[styles.statBadgeText, { color: theme.colors.error }]}>
                          {dealbreakersBreakdown.noCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.categoryScore}>
                    {t('Category score')}: {dealbreakersBreakdown.score}%
                  </Text>
                </View>
              )}

              {/* Desired Section */}
              {desiredBreakdown && (
                <View style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{t('Desired Traits')}</Text>
                    <Text style={styles.categoryWeight}>(40%)</Text>
                  </View>
                  <ProgressBar score={desiredBreakdown.score} theme={theme} />
                  <View style={styles.categoryStats}>
                    <Text style={styles.statText}>
                      {t('{{confirmed}} of {{total}} confirmed', {
                        confirmed: desiredBreakdown.confirmed,
                        total: desiredBreakdown.total,
                      })}
                    </Text>
                    <View style={styles.yesNoStats}>
                      <View style={styles.statBadge}>
                        <Ionicons name="checkmark" size={14} color={theme.colors.success} />
                        <Text style={[styles.statBadgeText, { color: theme.colors.success }]}>
                          {desiredBreakdown.yesCount}
                        </Text>
                      </View>
                      <View style={styles.statBadge}>
                        <Ionicons name="close" size={14} color={theme.colors.error} />
                        <Text style={[styles.statBadgeText, { color: theme.colors.error }]}>
                          {desiredBreakdown.noCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.categoryScore}>
                    {t('Category score')}: {desiredBreakdown.score}%
                  </Text>
                </View>
              )}

              {/* Loss Aversion Explanation */}
              <View style={styles.explanationSection}>
                <Text style={styles.explanationTitle}>{t('How scoring works')}</Text>
                <Text style={styles.explanationText}>
                  {t(
                    '"No" responses have {{multiplier}}x impact because losing something we want feels stronger than gaining it.',
                    { multiplier }
                  )}
                </Text>
                <Text style={styles.explanationSubtext}>
                  {t('Based on behavioral research (loss aversion)')}
                </Text>
              </View>

              {/* Strictness Setting */}
              <View style={styles.settingsSection}>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>{t('Scoring mode')}:</Text>
                  <Text style={styles.settingsValue}>{strictnessLabel}</Text>
                </View>
                <TouchableOpacity onPress={handleGoToSettings} style={styles.settingsLink}>
                  <Text style={styles.settingsLinkText}>{t('Adjust in Settings')}</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface ProgressBarProps {
  score: number;
  theme: Theme;
}

const ProgressBar = ({ score, theme }: ProgressBarProps) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.backgroundCard,
          overflow: 'hidden',
        },
        fill: {
          height: '100%',
          borderRadius: 4,
        },
      }),
    [theme]
  );

  const barColor = useMemo(() => {
    if (score >= 70) return theme.colors.success;
    if (score >= 50) return theme.colors.warning;
    return theme.colors.error;
  }, [score, theme]);

  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${score}%`, backgroundColor: barColor }]} />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundCard,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      padding: 20,
    },
    overallSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    overallScore: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    overallLabel: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
    },
    categorySection: {
      marginBottom: 20,
      gap: 8,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    categoryTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    categoryWeight: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    categoryStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    yesNoStats: {
      flexDirection: 'row',
      gap: 12,
    },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    statBadgeText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
    },
    categoryScore: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    explanationSection: {
      backgroundColor: theme.colors.backgroundCard,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
    },
    explanationTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    explanationText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    explanationSubtext: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      fontStyle: 'italic',
    },
    settingsSection: {
      gap: 8,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    settingsLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    settingsValue: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    settingsLink: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsLinkText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
  });

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
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { ScoreBreakdown } from '@/types';
import { STRICTNESS_SETTINGS, type StrictnessLevel } from '@/utils/compatibility';

interface ScoreBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  breakdown: ScoreBreakdown[];
  overallScore: number;
  strictness: StrictnessLevel;
  onStrictnessChange?: (level: StrictnessLevel) => void;
}

const STRICTNESS_OPTIONS: StrictnessLevel[] = ['noEffect', 'gentle', 'normal', 'strict'];

/**
 * Modal explaining how the compatibility score is calculated.
 */
export const ScoreBreakdownModal = ({
  visible,
  onClose,
  breakdown,
  overallScore,
  strictness,
  onStrictnessChange,
}: ScoreBreakdownModalProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const multiplier = String(STRICTNESS_SETTINGS[strictness]);

  const dealbreakersBreakdown = breakdown.find((b) => b.category === 'dealbreaker');
  const desiredBreakdown = breakdown.find((b) => b.category === 'desired');

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

              {/* Strictness Selector */}
              {onStrictnessChange && (
                <View style={styles.strictnessSection}>
                  <Text style={styles.strictnessSectionTitle}>{t('Scoring mode')}</Text>
                  <View style={styles.strictnessOptions}>
                    {STRICTNESS_OPTIONS.map((level) => {
                      const isSelected = level === strictness;
                      const levelMultiplier = STRICTNESS_SETTINGS[level];
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[
                            styles.strictnessOption,
                            isSelected && styles.strictnessOptionSelected,
                          ]}
                          onPress={() => onStrictnessChange(level)}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: isSelected }}
                        >
                          <Text
                            style={[
                              styles.strictnessOptionLabel,
                              isSelected && styles.strictnessOptionLabelSelected,
                            ]}
                          >
                            {t(`strictness_${level}`)}
                          </Text>
                          <Text
                            style={[
                              styles.strictnessOptionMultiplier,
                              isSelected && styles.strictnessOptionMultiplierSelected,
                            ]}
                          >
                            {levelMultiplier}x
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
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
    strictnessSection: {
      gap: 12,
    },
    strictnessSectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    strictnessOptions: {
      flexDirection: 'row',
      gap: 8,
    },
    strictnessOption: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.backgroundCard,
      backgroundColor: theme.colors.backgroundCard,
      alignItems: 'center',
      gap: 2,
    },
    strictnessOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '15',
    },
    strictnessOptionLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    strictnessOptionLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    strictnessOptionMultiplier: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    strictnessOptionMultiplierSelected: {
      color: theme.colors.primary,
    },
  });

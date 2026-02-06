import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useProspects, useCompatibility } from '@/hooks';
import { useTranslation } from 'react-i18next';
import type { Prospect, ProspectStatus } from '@/types';

type ScoreMessage = {
  message: string;
  icon: 'happy' | 'neutral' | 'thinking' | 'concerned' | 'sad';
};

const getScoreMessage = (
  score: number | null,
  unknownCount: number,
  totalTraits: number,
  t: (key: string) => string
): ScoreMessage => {
  if (score === null || totalTraits === 0) {
    return { message: t('Still learning...'), icon: 'thinking' };
  }

  const unknownRatio = unknownCount / totalTraits;

  if (score >= 70) {
    return { message: t('Looking great!'), icon: 'happy' };
  }

  if (score >= 50) {
    if (unknownRatio > 0.5) {
      return { message: t('Still getting to know them'), icon: 'thinking' };
    }
    return { message: t('Some things to consider'), icon: 'neutral' };
  }

  if (score >= 30) {
    return { message: t('Some important differences'), icon: 'concerned' };
  }

  return { message: t("Might not be the best fit"), icon: 'sad' };
};

const STATUS_OPTIONS: { value: ProspectStatus; labelKey: string }[] = [
  { value: 'talking', labelKey: 'Talking' },
  { value: 'dating', labelKey: 'Dating' },
  { value: 'relationship', labelKey: 'In a Relationship' },
];

const ProspectScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const { getProspectDetails, updateProspectInfo, updateProspectStatus, archive, remove } =
    useProspects();
  const { calculateScore } = useCompatibility();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Load prospect details
  useEffect(() => {
    const loadProspect = async () => {
      if (!id) return;
      setIsLoading(true);
      const data = await getProspectDetails(id);
      setProspect(data);
      setNotesText(data?.notes || '');
      setIsLoading(false);
    };
    loadProspect();
  }, [id, getProspectDetails]);

  // Calculate compatibility
  const compatibility = useMemo(() => {
    if (!prospect?.traits.length) return null;
    return calculateScore(prospect.traits);
  }, [prospect?.traits, calculateScore]);

  const scoreMessage = useMemo(() => {
    return getScoreMessage(
      compatibility?.overall ?? null,
      compatibility?.unknownCount ?? 0,
      prospect?.traits.length ?? 0,
      t
    );
  }, [compatibility, prospect?.traits.length, t]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMenuPress = useCallback(() => {
    setShowMenu(!showMenu);
  }, [showMenu]);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    // TODO: Navigate to edit screen or open edit modal
    Alert.alert(tc('Coming soon'), 'Edit functionality will be available soon.');
  }, [tc]);

  const handleArchive = useCallback(async () => {
    setShowMenu(false);
    if (!prospect) return;

    Alert.alert(t('Archive'), `Archive ${prospect.name}?`, [
      { text: tc('Cancel'), style: 'cancel' },
      {
        text: t('Archive'),
        onPress: async () => {
          await archive(prospect.id);
          router.back();
        },
      },
    ]);
  }, [prospect, t, tc, archive, router]);

  const handleDelete = useCallback(async () => {
    setShowMenu(false);
    if (!prospect) return;

    Alert.alert(
      t('Delete Prospect'),
      `Are you sure you want to delete ${prospect.name}? This cannot be undone.`,
      [
        { text: tc('Cancel'), style: 'cancel' },
        {
          text: tc('Delete'),
          style: 'destructive',
          onPress: async () => {
            await remove(prospect.id);
            router.back();
          },
        },
      ]
    );
  }, [prospect, t, tc, remove, router]);

  const handleStatusChange = useCallback(
    async (newStatus: ProspectStatus) => {
      if (!prospect || prospect.status === newStatus) return;
      await updateProspectStatus(prospect.id, newStatus);
      setProspect((prev) => (prev ? { ...prev, status: newStatus } : null));
    },
    [prospect, updateProspectStatus]
  );

  const handleEvaluateTraits = useCallback(() => {
    router.push(`/prospect/${id}/traits`);
  }, [router, id]);

  const handleDateHistory = useCallback(() => {
    router.push(`/prospect/${id}/dates`);
  }, [router, id]);

  const handleWhyThisScore = useCallback(() => {
    // TODO: Open score breakdown modal
    Alert.alert(tc('Coming soon'), 'Score breakdown will be available soon.');
  }, [tc]);

  const handleSaveNotes = useCallback(async () => {
    if (!prospect) return;
    setIsSavingNotes(true);
    try {
      await updateProspectInfo(prospect.id, { notes: notesText.trim() || undefined });
      setProspect((prev) => (prev ? { ...prev, notes: notesText.trim() || undefined } : null));
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert(tc('Error'), tc('Failed to save notes.'));
    } finally {
      setIsSavingNotes(false);
    }
  }, [prospect, notesText, updateProspectInfo, tc]);

  const handleCancelNotes = useCallback(() => {
    setNotesText(prospect?.notes || '');
    setIsEditingNotes(false);
  }, [prospect?.notes]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!prospect) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Prospect not found</Text>
          <TouchableOpacity onPress={handleBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>{tc('Go back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dealbreakersWithNo = compatibility?.dealbreakersWithNo ?? [];
  const unknownCount = compatibility?.unknownCount ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel={tc('Go back')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {prospect.name}
        </Text>
        <TouchableOpacity
          onPress={handleMenuPress}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Overflow Menu */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="pencil" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.menuItemText}>{tc('Edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <Ionicons name="archive" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.menuItemText}>{t('Archive')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color={theme.colors.error} />
              <Text style={[styles.menuItemText, { color: theme.colors.error }]}>
                {tc('Delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Photo */}
        <View style={styles.photoSection}>
          {prospect.photoUri ? (
            <Image source={{ uri: prospect.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={64} color={theme.colors.textMuted} />
            </View>
          )}
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreRow}>
            <Text style={styles.scorePercentage}>
              {compatibility?.overall !== undefined ? `${compatibility.overall}%` : '--'}
            </Text>
            <Text style={styles.scoreLabel}>{t('compatible')}</Text>
          </View>
          <Text style={styles.scoreMessage}>{scoreMessage.message}</Text>
          <TouchableOpacity onPress={handleWhyThisScore} style={styles.whyScoreLink}>
            <Text style={styles.whyScoreLinkText}>{t('Why this score?')}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Dealbreaker Warning */}
        {dealbreakersWithNo.length > 0 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color={theme.colors.error} />
            <Text style={styles.warningText}>
              {dealbreakersWithNo.length === 1
                ? t('{{count}} dealbreaker confirmed "No"', { count: 1 })
                : t('{{count}} dealbreakers confirmed "No"', { count: dealbreakersWithNo.length })}
            </Text>
          </View>
        )}

        {/* Unknown Traits Encouragement */}
        {unknownCount > 0 && (
          <View style={styles.encouragementBanner}>
            <Ionicons name="help-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.encouragementText}>
              {t('{{count}} traits unknown', { count: unknownCount })} -{' '}
              {t('Keep learning about {{name}}!', { name: prospect.name.split(' ')[0] })}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEvaluateTraits}>
            <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>{t('Evaluate Traits')}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDateHistory}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>
              {t('Date History')} ({prospect.dates.length})
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <View style={styles.notesSectionHeader}>
            <Text style={styles.sectionTitle}>{t('Notes')}</Text>
            {!isEditingNotes && (
              <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
                <Ionicons name="pencil" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {isEditingNotes ? (
            <View style={styles.notesEditContainer}>
              <TextInput
                style={styles.notesInput}
                value={notesText}
                onChangeText={setNotesText}
                placeholder={tc('Add any notes...')}
                placeholderTextColor={theme.colors.textMuted}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.notesEditActions}>
                <TouchableOpacity
                  style={styles.notesEditButton}
                  onPress={handleCancelNotes}
                  disabled={isSavingNotes}
                >
                  <Text style={styles.notesEditButtonTextCancel}>{tc('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.notesEditButton, styles.notesEditButtonSave]}
                  onPress={handleSaveNotes}
                  disabled={isSavingNotes}
                >
                  {isSavingNotes ? (
                    <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
                  ) : (
                    <Text style={styles.notesEditButtonTextSave}>{tc('Save')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.notesText}>
              {prospect.notes || tc('No notes yet. Tap the pencil to add some.')}
            </Text>
          )}
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>{t('Status')}</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  prospect.status === option.value && styles.statusOptionSelected,
                ]}
                onPress={() => handleStatusChange(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: prospect.status === option.value }}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    prospect.status === option.value && styles.statusOptionTextSelected,
                  ]}
                >
                  {t(option.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    backLink: {
      padding: 8,
    },
    backLinkText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundCard,
    },
    headerButton: {
      padding: 8,
    },
    headerTitle: {
      flex: 1,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginHorizontal: 8,
    },
    menuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
    menuBackdrop: {
      flex: 1,
    },
    menu: {
      position: 'absolute',
      top: 56,
      right: 16,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      ...theme.shadows.md,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    menuItemText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 20,
    },
    photoSection: {
      alignItems: 'center',
    },
    photo: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    photoPlaceholder: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: theme.colors.backgroundCard,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scoreSection: {
      alignItems: 'center',
      gap: 4,
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
    },
    scorePercentage: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    scoreLabel: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
    },
    scoreMessage: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    whyScoreLink: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    whyScoreLinkText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.error + '15',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
    },
    warningText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.error,
      fontWeight: '500',
    },
    encouragementBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
    },
    encouragementText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    actionsSection: {
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 12,
    },
    actionButtonText: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    notesSection: {
      backgroundColor: theme.colors.backgroundCard,
      padding: 16,
      borderRadius: 12,
    },
    notesSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    notesText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      lineHeight: 22,
    },
    notesEditContainer: {
      gap: 12,
    },
    notesInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      minHeight: 100,
    },
    notesEditActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    notesEditButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    notesEditButtonSave: {
      backgroundColor: theme.colors.primary,
    },
    notesEditButtonTextCancel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    notesEditButtonTextSave: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textOnPrimary,
      fontWeight: '500',
    },
    statusSection: {
      gap: 12,
    },
    statusOptions: {
      flexDirection: 'row',
      gap: 8,
    },
    statusOption: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundCard,
      alignItems: 'center',
    },
    statusOptionSelected: {
      backgroundColor: theme.colors.primary,
    },
    statusOptionText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    statusOptionTextSelected: {
      color: theme.colors.textOnPrimary,
    },
  });

export default ProspectScreen;

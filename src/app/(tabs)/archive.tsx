import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useProspects, useAuth } from '@/hooks';
import type { ProspectListData } from '@/services/firebase/firestore';
import { getProspectSummary } from '@/services/firebase/firestore';
import { DeleteConfirmationModal, RetentionWarningModal } from '@/components/prospects';
import { isExpiringSoon, isApproachingExpiry, getMonthsUntilExpiry } from '@/utils';

interface DeleteSummary {
  dateCount: number;
  evaluatedTraitCount: number;
  hasNotes: boolean;
}

const ArchiveScreen = () => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { archivedProspects, restore, remove, resetArchiveTimer, refreshProspects, isLoading } =
    useProspects();
  const { user } = useAuth();

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<ProspectListData | null>(null);
  const [deleteSummary, setDeleteSummary] = useState<DeleteSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Retention warning modal state
  const [retentionTarget, setRetentionTarget] = useState<ProspectListData | null>(null);

  const handleRestore = useCallback(
    (prospect: ProspectListData) => {
      Alert.alert(
        t('Restore {{name}}?', { name: prospect.name }),
        t('This will move {{name}} back to your active prospects.', { name: prospect.name }),
        [
          { text: tc('Cancel'), style: 'cancel' },
          {
            text: t('Restore'),
            onPress: () => restore(prospect.id),
          },
        ]
      );
    },
    [t, tc, restore]
  );

  const handleDeletePress = useCallback(
    async (prospect: ProspectListData) => {
      if (!user) return;
      setDeleteTarget(prospect);
      setIsLoadingSummary(true);
      try {
        const summary = await getProspectSummary(user.uid, prospect.id);
        setDeleteSummary(summary);
      } catch {
        // Fall back to showing modal without counts
        setDeleteSummary({ dateCount: 0, evaluatedTraitCount: 0, hasNotes: false });
      } finally {
        setIsLoadingSummary(false);
      }
    },
    [user]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      remove(deleteTarget.id);
    }
    setDeleteTarget(null);
    setDeleteSummary(null);
  }, [deleteTarget, remove]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
    setDeleteSummary(null);
  }, []);

  const handleRetentionCardPress = useCallback((prospect: ProspectListData) => {
    setRetentionTarget(prospect);
  }, []);

  const handleRetentionRestore = useCallback(() => {
    if (retentionTarget) {
      restore(retentionTarget.id);
    }
    setRetentionTarget(null);
  }, [retentionTarget, restore]);

  const handleRetentionKeep = useCallback(() => {
    if (retentionTarget) {
      resetArchiveTimer(retentionTarget.id);
    }
    setRetentionTarget(null);
  }, [retentionTarget, resetArchiveTimer]);

  const handleRetentionClose = useCallback(() => {
    setRetentionTarget(null);
  }, []);

  const formatArchivedDate = useCallback(
    (date?: Date) => {
      if (!date) return '';
      return t('Archived {{date}}', {
        date: date.toLocaleDateString(i18n.language),
      });
    },
    [t]
  );

  const renderItem = useCallback(
    ({ item }: { item: ProspectListData }) => {
      const expiringSoon = item.archivedAt ? isExpiringSoon(item.archivedAt) : false;
      const approachingExpiry = item.archivedAt ? isApproachingExpiry(item.archivedAt) : false;
      const monthsLeft = item.archivedAt ? getMonthsUntilExpiry(item.archivedAt) : null;
      const hasWarning = expiringSoon || approachingExpiry;

      return (
        <TouchableOpacity
          style={styles.card}
          accessibilityLabel={item.name}
          activeOpacity={hasWarning ? 0.7 : 1}
          onPress={hasWarning ? () => handleRetentionCardPress(item) : undefined}
          disabled={!hasWarning}
        >
          <View style={styles.cardContent}>
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={24} color={theme.colors.textMuted} />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardDate}>
                {formatArchivedDate(item.archivedAt)}
              </Text>
              {expiringSoon && (
                <View style={[styles.warningBadge, styles.warningBadgeExpiring]}>
                  <Ionicons name="warning" size={12} color={theme.colors.error} />
                  <Text style={[styles.warningBadgeText, { color: theme.colors.error }]}>
                    {t('Less than a month left')}
                  </Text>
                </View>
              )}
              {!expiringSoon && approachingExpiry && monthsLeft !== null && (
                <View style={styles.warningBadge}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.warning} />
                  <Text style={[styles.warningBadgeText, { color: theme.colors.warning }]}>
                    {t(monthsLeft === 1 ? '{{count}} month left' : '{{count}} months left', {
                      count: monthsLeft,
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={() => handleRestore(item)}
              accessibilityRole="button"
              accessibilityLabel={t('Restore')}
            >
              <Ionicons name="arrow-undo" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePress(item)}
              accessibilityRole="button"
              accessibilityLabel={tc('Delete')}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [
      styles,
      theme,
      formatArchivedDate,
      handleRestore,
      handleDeletePress,
      handleRetentionCardPress,
      t,
      tc,
    ]
  );

  const keyExtractor = useCallback((item: ProspectListData) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [styles.separator]
  );

  if (archivedProspects.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Archive')}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="archive-outline" size={64} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>{t('No archived prospects')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('Prospects you archive will appear here')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Archive')}</Text>
      </View>
      <FlatList
        data={archivedProspects}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshProspects}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmationModal
          visible={!isLoadingSummary && deleteSummary !== null}
          prospectName={deleteTarget.name}
          dateCount={deleteSummary?.dateCount ?? 0}
          evaluatedTraitCount={deleteSummary?.evaluatedTraitCount ?? 0}
          onDelete={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Loading indicator while fetching summary */}
      {isLoadingSummary && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Retention Warning Modal */}
      {retentionTarget && (
        <RetentionWarningModal
          visible={retentionTarget !== null}
          prospectName={retentionTarget.name}
          onRestore={handleRetentionRestore}
          onKeepInArchive={handleRetentionKeep}
          onClose={handleRetentionClose}
        />
      )}
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
      borderBottomColor: theme.colors.backgroundCard,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    listContent: {
      padding: 16,
    },
    separator: {
      height: 8,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.backgroundCard,
      padding: 16,
      borderRadius: 12,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    photo: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    photoPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardInfo: {
      flex: 1,
    },
    cardName: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    cardDate: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
    },
    restoreButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primary + '15',
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.error + '15',
    },
    warningBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: theme.colors.warning + '15',
      alignSelf: 'flex-start',
    },
    warningBadgeExpiring: {
      backgroundColor: theme.colors.error + '15',
    },
    warningBadgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '500',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default ArchiveScreen;

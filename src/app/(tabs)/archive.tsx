import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useProspects } from '@/hooks';
import type { ProspectListData } from '@/services/firebase/firestore';

const ArchiveScreen = () => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { archivedProspects, restore, remove, refreshProspects, isLoading } = useProspects();

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

  const handleDelete = useCallback(
    (prospect: ProspectListData) => {
      Alert.alert(
        t('Delete Prospect'),
        t('Are you sure you want to delete {{name}}? This cannot be undone.', { name: prospect.name }),
        [
          { text: tc('Cancel'), style: 'cancel' },
          {
            text: tc('Delete'),
            style: 'destructive',
            onPress: () => remove(prospect.id),
          },
        ]
      );
    },
    [t, tc, remove]
  );

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
    ({ item }: { item: ProspectListData }) => (
      <View style={styles.card} accessibilityLabel={item.name}>
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
            onPress={() => handleDelete(item)}
            accessibilityRole="button"
            accessibilityLabel={tc('Delete')}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [styles, theme, formatArchivedDate, handleRestore, handleDelete, t, tc]
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
  });

export default ArchiveScreen;

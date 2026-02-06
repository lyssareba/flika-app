import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, useProspects, useDateMutations } from '@/hooks';
import {
  DateCard,
  DateForm,
  EmptyDateState,
  type DateFormData,
} from '@/components/dates';
import { groupDatesByMonth } from '@/utils/dateHelpers';
import type { Theme } from '@/theme';
import type { DateEntry, Prospect } from '@/types';

interface Section {
  title: string;
  data: DateEntry[];
}

const DatesScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const { getProspectDetails, refreshProspects } = useProspects();
  const { addDate, updateDate, deleteDate, isAdding, isUpdating } =
    useDateMutations(id || '');

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDateForm, setShowDateForm] = useState(false);
  const [editingDate, setEditingDate] = useState<DateEntry | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Load prospect details
  const loadProspect = useCallback(async () => {
    if (!id) return;
    const data = await getProspectDetails(id);
    setProspect(data);
  }, [id, getProspectDetails]);

  // Initial load
  React.useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadProspect();
      setIsLoading(false);
    };
    init();
  }, [loadProspect]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshProspects();
    await loadProspect();
    setIsRefreshing(false);
  }, [refreshProspects, loadProspect]);

  // Group dates by month for section list
  const sections = useMemo((): Section[] => {
    if (!prospect?.dates.length) return [];

    const grouped = groupDatesByMonth(prospect.dates);
    const result: Section[] = [];

    grouped.forEach((dates, monthKey) => {
      result.push({
        title: monthKey.toUpperCase(),
        data: dates,
      });
    });

    return result;
  }, [prospect?.dates]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddDate = useCallback(() => {
    setEditingDate(null);
    setShowDateForm(true);
  }, []);

  const handleEditDate = useCallback((dateEntry: DateEntry) => {
    setEditingDate(dateEntry);
    setShowDateForm(true);
  }, []);

  const handleDeleteDate = useCallback(
    async (dateEntry: DateEntry) => {
      Alert.alert(
        t('Delete Date'),
        t('Are you sure you want to delete this date?'),
        [
          { text: tc('Cancel'), style: 'cancel' },
          {
            text: tc('Delete'),
            style: 'destructive',
            onPress: async () => {
              await deleteDate(dateEntry.id);
              await loadProspect();
            },
          },
        ]
      );
    },
    [t, tc, deleteDate, loadProspect]
  );

  const handleSaveDate = useCallback(
    async (data: DateFormData) => {
      if (editingDate) {
        // Update existing date
        await updateDate({
          dateId: editingDate.id,
          updates: {
            date: data.date,
            location: data.location,
            rating: data.rating,
            notes: data.notes,
          },
        });
      } else {
        // Add new date
        await addDate({
          date: data.date,
          location: data.location,
          rating: data.rating,
          notes: data.notes,
        });
      }
      await loadProspect();
    },
    [editingDate, addDate, updateDate, loadProspect]
  );

  const handleNavigateToTraits = useCallback(() => {
    setShowDateForm(false);
    router.push(`/prospect/${id}/traits`);
  }, [router, id]);

  const handleCloseForm = useCallback(() => {
    setShowDateForm(false);
    setEditingDate(null);
  }, []);

  // Render section header
  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    [styles]
  );

  // Render date card
  const renderItem = useCallback(
    ({ item }: { item: DateEntry }) => (
      <DateCard
        dateEntry={item}
        traits={prospect?.traits || []}
        onEdit={handleEditDate}
        onDelete={handleDeleteDate}
      />
    ),
    [prospect?.traits, handleEditDate, handleDeleteDate]
  );

  // Render separator
  const renderItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [styles]
  );

  const renderSectionSeparator = useCallback(
    () => <View style={styles.sectionSeparator} />,
    [styles]
  );

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

  const hasDates = prospect.dates.length > 0;

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
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Date History')}</Text>
        <TouchableOpacity
          onPress={handleAddDate}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel={t('Log a Date')}
        >
          <Ionicons name="add" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {hasDates ? (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderItemSeparator}
          SectionSeparatorComponent={renderSectionSeparator}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      ) : (
        <EmptyDateState prospectName={prospect.name} onAddDate={handleAddDate} />
      )}

      {/* Date Form Modal */}
      <DateForm
        visible={showDateForm}
        onClose={handleCloseForm}
        onSave={handleSaveDate}
        onNavigateToTraits={handleNavigateToTraits}
        initialData={editingDate || undefined}
        isEditing={!!editingDate}
      />

      {/* Loading overlay for mutations */}
      {(isAdding || isUpdating) && (
        <View style={styles.mutationOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
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
      borderBottomColor: theme.colors.border,
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
    },
    listContent: {
      padding: 16,
      paddingBottom: 48,
    },
    sectionHeader: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      letterSpacing: 0.5,
    },
    itemSeparator: {
      height: 8,
    },
    sectionSeparator: {
      height: 8,
    },
    mutationOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default DatesScreen;

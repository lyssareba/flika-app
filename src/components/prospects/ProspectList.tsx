import React, { useMemo, useCallback } from 'react';
import { View, Text, SectionList, StyleSheet, RefreshControl } from 'react-native';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { ProspectCard } from './ProspectCard';
import type { ProspectListData } from '@/services/firebase/firestore';

interface ProspectListProps {
  prospects: ProspectListData[];
  onProspectPress: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

interface Section {
  title: string;
  data: ProspectListData[];
}

/**
 * Sectioned list of prospects organized by status.
 * Sections: Relationship (banner), Dating, Talking
 */
export const ProspectList = ({
  prospects,
  onProspectPress,
  onRefresh,
  refreshing = false,
}: ProspectListProps) => {
  const { t } = useTranslation('prospect');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Organize prospects into sections
  const sections = useMemo((): Section[] => {
    const relationship = prospects.filter((p) => p.status === 'relationship');
    const dating = prospects
      .filter((p) => p.status === 'dating')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const talking = prospects
      .filter((p) => p.status === 'talking')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const result: Section[] = [];

    if (relationship.length > 0) {
      result.push({ title: t('In a Relationship'), data: relationship });
    }

    if (dating.length > 0) {
      result.push({ title: t('Dating'), data: dating });
    }

    if (talking.length > 0) {
      result.push({ title: t('Talking'), data: talking });
    }

    return result;
  }, [prospects, t]);

  // We need to track scores per prospect
  // For now, we'll show "still learning" and calculate on detail view
  // In a future iteration, we could cache scores or compute them

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    [styles]
  );

  const renderItem = useCallback(
    ({ item }: { item: ProspectListData }) => (
      <View style={styles.cardContainer}>
        <ProspectCard
          id={item.id}
          name={item.name}
          photoUri={item.photoUri}
          status={item.status}
          compatibilityScore={null} // Will be calculated when we have traits
          dealbreakersWithNoCount={0} // Will be calculated when we have traits
          lastDateAt={item.updatedAt} // Approximation - actual last date from dates subcollection
          createdAt={item.createdAt}
          onPress={onProspectPress}
        />
      </View>
    ),
    [onProspectPress, styles]
  );

  const keyExtractor = useCallback((item: ProspectListData) => item.id, []);

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
    />
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    sectionHeader: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardContainer: {
      // Card styling handled by ProspectCard
    },
    separator: {
      height: 8,
    },
    sectionSeparator: {
      height: 8,
    },
  });

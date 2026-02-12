import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { TraitState } from '@/types';

type FilterOption = 'all' | TraitState;

interface FilterCounts {
  all: number;
  yes: number;
  no: number;
  unknown: number;
}

interface TraitFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  counts: FilterCounts;
}

export const TraitFilterBar: React.FC<TraitFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const filters: { key: FilterOption; label: string; color?: string }[] = [
    { key: 'all', label: t('All') },
    { key: 'yes', label: t('Yes'), color: theme.colors.traitYesText },
    { key: 'no', label: t('No'), color: theme.colors.traitNoText },
    { key: 'unknown', label: t('Unknown'), color: theme.colors.textMuted },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={t('Search traits...')}
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('Search traits')}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} accessibilityRole="button" accessibilityLabel={t('Clear search')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filtersScroll}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const count = counts[filter.key];

          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
                isActive && filter.color && { backgroundColor: filter.color + '20' },
              ]}
              onPress={() => onFilterChange(filter.key)}
              accessibilityRole="button"
              accessibilityLabel={`${filter.label} ${count}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                  isActive && filter.color && { color: filter.color },
                ]}
              >
                {filter.label}
              </Text>
              <Text
                style={[
                  styles.filterCount,
                  isActive && styles.filterCountActive,
                  isActive && filter.color && { color: filter.color },
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
      gap: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      padding: 0,
    },
    filtersScroll: {
      marginHorizontal: -16,
    },
    filtersContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: 44,
      justifyContent: 'center',
      borderRadius: 16,
      gap: 6,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary + '20',
    },
    filterText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    filterTextActive: {
      color: theme.colors.primary,
    },
    filterCount: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
    filterCountActive: {
      color: theme.colors.primary,
    },
  });

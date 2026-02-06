import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useProspects, useTraits, useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';
import {
  TraitFilterBar,
  TraitSwipeRow,
  SwipeTutorial,
} from '@/components/traits';
import {
  isSwipeTutorialDismissed,
  setSwipeTutorialDismissed,
} from '@/services/storage/asyncStorage';
import type { Prospect, Trait, TraitState } from '@/types';

type FilterOption = 'all' | TraitState;

const TraitsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const { t: tc } = useTranslation('common');
  const { getProspectDetails } = useProspects();
  const { updateTraitState } = useTraits();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [showTutorial, setShowTutorial] = useState(false);

  // Load prospect details
  useEffect(() => {
    const loadProspect = async () => {
      if (!id) return;
      setIsLoading(true);
      const data = await getProspectDetails(id);
      setProspect(data);
      setIsLoading(false);
    };
    loadProspect();
  }, [id, getProspectDetails]);

  // Check tutorial dismissal state
  useEffect(() => {
    const checkTutorial = async () => {
      if (!user) return;
      const dismissed = await isSwipeTutorialDismissed(user.uid);
      setShowTutorial(!dismissed);
    };
    checkTutorial();
  }, [user]);

  // Count traits by state
  const counts = useMemo(() => {
    const traits = prospect?.traits ?? [];
    return {
      all: traits.length,
      yes: traits.filter((t) => t.state === 'yes').length,
      no: traits.filter((t) => t.state === 'no').length,
      unknown: traits.filter((t) => t.state === 'unknown').length,
    };
  }, [prospect?.traits]);

  // Filter and search traits
  const filteredTraits = useMemo(() => {
    let traits = prospect?.traits ?? [];

    // Filter by state
    if (activeFilter !== 'all') {
      traits = traits.filter((t) => t.state === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      traits = traits.filter((t) =>
        t.attributeName.toLowerCase().includes(query)
      );
    }

    // Sort: dealbreakers first, then by name
    return [...traits].sort((a, b) => {
      if (a.attributeCategory === 'dealbreaker' && b.attributeCategory !== 'dealbreaker') {
        return -1;
      }
      if (a.attributeCategory !== 'dealbreaker' && b.attributeCategory === 'dealbreaker') {
        return 1;
      }
      return a.attributeName.localeCompare(b.attributeName);
    });
  }, [prospect?.traits, activeFilter, searchQuery]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleTutorialDismiss = useCallback(async () => {
    if (!user) return;
    await setSwipeTutorialDismissed(user.uid);
    setShowTutorial(false);
  }, [user]);

  const handleTraitStateChange = useCallback(
    async (traitId: string, newState: TraitState) => {
      if (!id || !prospect) return;

      try {
        await updateTraitState(id, traitId, newState);

        // Update local state optimistically
        setProspect((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            traits: prev.traits.map((t) =>
              t.id === traitId ? { ...t, state: newState, updatedAt: new Date() } : t
            ),
          };
        });
      } catch (error) {
        console.error('Error updating trait:', error);
      }
    },
    [id, prospect, updateTraitState]
  );

  const renderTrait = useCallback(
    ({ item }: { item: Trait }) => (
      <TraitSwipeRow trait={item} onStateChange={handleTraitStateChange} />
    ),
    [handleTraitStateChange]
  );

  const keyExtractor = useCallback((item: Trait) => item.id, []);

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

  return (
    <GestureHandlerRootView style={styles.flex}>
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
          <View style={styles.headerButton} />
        </View>

        {/* Filter Bar */}
        <TraitFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        {/* Tutorial */}
        {showTutorial && (
          <SwipeTutorial visible={showTutorial} onDismiss={handleTutorialDismiss} />
        )}

        {/* Traits List */}
        {filteredTraits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search"
              size={48}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery ? t('No matching traits') : t('No traits')}
            </Text>
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>{tc('Clear search')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredTraits}
            renderItem={renderTrait}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
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
      width: 40,
    },
    headerTitle: {
      flex: 1,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginHorizontal: 8,
    },
    listContent: {
      paddingVertical: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      gap: 12,
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    clearSearchText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      marginTop: 8,
    },
  });

export default TraitsScreen;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useProspects, useTraits, useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';
import {
  TraitTabs,
  TraitSwipeCard,
  TraitList,
  SwipeTutorial,
} from '@/components/traits';
import {
  isSwipeTutorialDismissed,
  setSwipeTutorialDismissed,
} from '@/services/storage/asyncStorage';
import type { Prospect, TraitState } from '@/types';

type TabType = 'toEvaluate' | 'evaluated';

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
  const [activeTab, setActiveTab] = useState<TabType>('toEvaluate');
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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

  // Group traits
  const unknownTraits = useMemo(
    () => prospect?.traits.filter((t) => t.state === 'unknown') ?? [],
    [prospect?.traits]
  );

  const evaluatedTraits = useMemo(
    () => prospect?.traits.filter((t) => t.state !== 'unknown') ?? [],
    [prospect?.traits]
  );

  // Group unknown traits by category
  const dealbreakers = useMemo(
    () => unknownTraits.filter((t) => t.attributeCategory === 'dealbreaker'),
    [unknownTraits]
  );

  const desired = useMemo(
    () => unknownTraits.filter((t) => t.attributeCategory === 'desired'),
    [unknownTraits]
  );

  // Combine dealbreakers first, then desired for swipe order
  const orderedUnknownTraits = useMemo(
    () => [...dealbreakers, ...desired],
    [dealbreakers, desired]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

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

        // Move to next card if evaluating and trait was marked
        if (newState !== 'unknown' && activeTab === 'toEvaluate') {
          const currentTraitIndex = orderedUnknownTraits.findIndex(
            (t) => t.id === traitId
          );
          if (
            currentTraitIndex !== -1 &&
            currentTraitIndex < orderedUnknownTraits.length - 1
          ) {
            setCurrentCardIndex(currentTraitIndex + 1);
          }
        }
      } catch (error) {
        console.error('Error updating trait:', error);
      }
    },
    [id, prospect, updateTraitState, activeTab, orderedUnknownTraits]
  );

  const handleTraitReset = useCallback(
    async (traitId: string) => {
      await handleTraitStateChange(traitId, 'unknown');
    },
    [handleTraitStateChange]
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

  const currentTrait = orderedUnknownTraits[currentCardIndex];

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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TraitTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            toEvaluateCount={unknownTraits.length}
            evaluatedCount={evaluatedTraits.length}
          />
        </View>

        {/* Content */}
        {activeTab === 'toEvaluate' ? (
          <View style={styles.evaluateContainer}>
            {/* Tutorial */}
            <SwipeTutorial visible={showTutorial} onDismiss={handleTutorialDismiss} />

            {orderedUnknownTraits.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={theme.colors.traitYesText}
                />
                <Text style={styles.emptyTitle}>{t('All traits evaluated!')}</Text>
                <Text style={styles.emptySubtitle}>
                  {t('Tap any trait to reset to unknown')}
                </Text>
                <TouchableOpacity
                  style={styles.viewEvaluatedButton}
                  onPress={() => setActiveTab('evaluated')}
                >
                  <Text style={styles.viewEvaluatedText}>{t('Evaluated')}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {currentCardIndex + 1} / {orderedUnknownTraits.length}
                  </Text>
                  {currentTrait?.attributeCategory === 'dealbreaker' && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{t('Dealbreakers')}</Text>
                    </View>
                  )}
                </View>

                {/* Swipe Card */}
                {currentTrait && (
                  <TraitSwipeCard
                    key={currentTrait.id}
                    trait={currentTrait}
                    onStateChange={handleTraitStateChange}
                  />
                )}

                {/* Navigation dots */}
                <View style={styles.dotsContainer}>
                  {orderedUnknownTraits.slice(0, 10).map((trait, index) => (
                    <TouchableOpacity
                      key={trait.id}
                      style={[
                        styles.dot,
                        index === currentCardIndex && styles.dotActive,
                      ]}
                      onPress={() => setCurrentCardIndex(index)}
                    />
                  ))}
                  {orderedUnknownTraits.length > 10 && (
                    <Text style={styles.moreDotsText}>
                      +{orderedUnknownTraits.length - 10}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.evaluatedContainer}>
            {evaluatedTraits.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="help-circle"
                  size={64}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.emptyTitle}>{t('No traits to evaluate')}</Text>
                <TouchableOpacity
                  style={styles.viewEvaluatedButton}
                  onPress={() => setActiveTab('toEvaluate')}
                >
                  <Text style={styles.viewEvaluatedText}>{t('To Evaluate')}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TraitList traits={evaluatedTraits} onTraitPress={handleTraitReset} />
            )}
          </View>
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
    tabsContainer: {
      padding: 16,
      paddingBottom: 8,
    },
    evaluateContainer: {
      flex: 1,
    },
    evaluatedContainer: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      gap: 12,
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    viewEvaluatedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      gap: 4,
    },
    viewEvaluatedText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      gap: 12,
    },
    progressText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    categoryBadge: {
      backgroundColor: theme.colors.warning + '20',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.backgroundCard,
    },
    dotActive: {
      backgroundColor: theme.colors.primary,
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    moreDotsText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      marginLeft: 4,
    },
  });

export default TraitsScreen;

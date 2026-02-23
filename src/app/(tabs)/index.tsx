import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';
import { useProspects, useHomePrompts, useFeatureAccess, usePremiumFeature } from '@/hooks';
import { ProspectList, EmptyState } from '@/components/prospects';
import { PromptBanner } from '@/components/prompts';
import { UpgradeBanner } from '@/components/premium';
import type { InAppPrompt } from '@/types';

const HomeScreen = () => {
  const router = useRouter();
  const { theme } = useThemeContext();
  const { t: tp } = useTranslation('premium');
  const {
    activeProspects,
    isLoading,
    refreshProspects,
  } = useProspects();
  const { canAddProspect, activeProspectCount, activeProspectLimit } = useFeatureAccess();
  const { requirePremium } = usePremiumFeature();
  const { prompt, dismiss } = useHomePrompts(activeProspects);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePromptPress = useCallback(
    (p: InAppPrompt) => {
      if (p.prospectId) {
        router.push(`/prospect/${p.prospectId}`);
      }
    },
    [router]
  );

  const handleProspectPress = useCallback(
    (id: string) => {
      router.push(`/prospect/${id}`);
    },
    [router]
  );

  const handleAddPress = useCallback(() => {
    if (canAddProspect) {
      router.push('/prospect/add');
    } else {
      requirePremium(() => {}, { feature: 'prospects' });
    }
  }, [canAddProspect, requirePremium, router]);

  const handleSettingsPress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Flika</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleAddPress}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Add prospect"
          >
            <Ionicons name="add" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Prompt Banner */}
      {prompt && (
        <View style={styles.promptContainer}>
          <PromptBanner prompt={prompt} onDismiss={dismiss} onPress={handlePromptPress} />
        </View>
      )}

      {/* Slots Indicator */}
      {activeProspectLimit !== Infinity && (
        <View style={styles.slotsContainer}>
          <Text style={styles.slotsText}>
            {tp('home.slotsUsed', { count: activeProspectCount, limit: activeProspectLimit })}
          </Text>
        </View>
      )}

      {/* Upgrade Banner */}
      <View style={styles.bannerContainer}>
        <UpgradeBanner />
      </View>

      {/* Content */}
      {!isLoading && activeProspects.length === 0 ? (
        <EmptyState onAddPress={handleAddPress} />
      ) : (
        <ProspectList
          prospects={activeProspects}
          onProspectPress={handleProspectPress}
          onRefresh={refreshProspects}
          refreshing={isLoading}
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: '700',
      color: theme.colors.primary,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerButton: {
      padding: 8,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    promptContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    slotsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    slotsText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    bannerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  });

export default HomeScreen;

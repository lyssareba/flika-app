import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useAttributes } from '@/hooks';
import type { Attribute } from '@/types';

interface DealbreakersStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const DealbreakersStep = ({ onNext, onBack }: DealbreakersStepProps) => {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
  const { theme } = useThemeContext();
  const { attributes, toggleCategory } = useAttributes();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderAttribute = ({ item }: { item: Attribute }) => {
    const isDealbreaker = item.category === 'dealbreaker';

    return (
      <TouchableOpacity
        style={[styles.card, isDealbreaker && styles.cardDealbreaker]}
        onPress={() => toggleCategory(item.id)}
        accessibilityLabel={`${item.name}, ${isDealbreaker ? 'dealbreaker, tap to remove' : 'tap to mark as dealbreaker'}`}
        accessibilityRole="button"
      >
        <Text style={[styles.cardText, isDealbreaker && styles.cardTextDealbreaker]}>
          {item.name}
        </Text>
        {isDealbreaker && (
          <Ionicons name="star" size={18} color={theme.colors.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityLabel={tc('Back')}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('Which are dealbreakers?')}</Text>
        <Text style={styles.subtitle}>
          {t('These are weighted 60% in compatibility scoring')}
        </Text>
        <Text style={styles.hint}>{t('Tap to mark as dealbreaker')}</Text>
      </View>

      <FlatList
        data={attributes}
        keyExtractor={(item) => item.id}
        renderItem={renderAttribute}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNext}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{tc('Next')}</Text>
        </TouchableOpacity>
      </View>
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
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 16,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    hint: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    columnWrapper: {
      gap: 10,
      marginBottom: 10,
    },
    card: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    cardDealbreaker: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.backgroundElevated,
    },
    cardText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    cardTextDealbreaker: {
      fontWeight: '600',
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
    },
  });

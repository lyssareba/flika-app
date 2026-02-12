import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useAttributes } from '@/hooks';

interface AttributesStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const AttributesStep = ({ onNext, onBack }: AttributesStepProps) => {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
  const { theme } = useThemeContext();
  const {
    attributes,
    suggestions,
    hasMinimumAttributes,
    addAttribute,
    addAttributeFromSuggestion,
    removeAttribute,
    refreshSuggestions,
  } = useAttributes();
  const [inputValue, setInputValue] = useState('');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleAdd = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    await addAttribute(trimmed, 'desired');
    setInputValue('');
  };

  const handleSuggestionPress = async (name: string) => {
    await addAttributeFromSuggestion(name, 'desired');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityLabel={tc('Back')} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('What matters to you?')}</Text>
        <Text style={styles.subtitle}>
          {t('Add qualities you look for in a partner.')}
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={t('Type or pick from below...')}
          placeholderTextColor={theme.colors.textMuted}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          accessibilityLabel={t('Type or pick from below...')}
        />
        <TouchableOpacity
          style={[styles.addButton, !inputValue.trim() && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!inputValue.trim()}
          accessibilityLabel={tc('Add')}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.sectionLabel}>{t('Suggestions (tap to add):')}</Text>
            <TouchableOpacity onPress={refreshSuggestions} accessibilityLabel={tc('Refresh')} accessibilityRole="button">
              <Ionicons name="refresh" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.chipRow}>
            {suggestions.map((name) => (
              <TouchableOpacity
                key={name}
                style={styles.chip}
                onPress={() => handleSuggestionPress(name)}
                accessibilityRole="button"
                accessibilityLabel={name}
              >
                <Text style={styles.chipText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.listSection}>
        <Text style={styles.sectionLabel}>{t('Your attributes:')}</Text>
        <FlatList
          data={attributes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.attributeRow}>
              <Text style={styles.attributeName}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => removeAttribute(item.id)}
                accessibilityLabel={`${tc('Delete')} ${item.name}`}
              >
                <Ionicons name="close-circle" size={22} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {t('Minimum 3 attributes required')}
            </Text>
          }
        />
      </View>

      <View style={styles.footer}>
        {!hasMinimumAttributes && (
          <Text style={styles.minText}>{t('Minimum 3 attributes required')}</Text>
        )}
        <TouchableOpacity
          style={[styles.primaryButton, !hasMinimumAttributes && styles.buttonDisabled]}
          onPress={onNext}
          disabled={!hasMinimumAttributes}
          accessibilityRole="button"
          accessibilityLabel={tc('Next')}
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
    inputRow: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingTop: 20,
      gap: 8,
    },
    textInput: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonDisabled: {
      opacity: 0.5,
    },
    suggestionsSection: {
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    suggestionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primaryDark,
    },
    listSection: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    attributeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    attributeName: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
      paddingVertical: 24,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    minText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: 8,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
    },
  });

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext, type Theme } from '@/theme';
import { useAttributes } from '@/hooks';
import type { Attribute, AttributeCategory } from '@/types';

interface AddAttributeSectionProps {
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useThemeContext>['theme'];
}

const AddAttributeSection = React.memo(
  function AddAttributeSection({ styles, theme }: AddAttributeSectionProps) {
    const { t } = useTranslation('settings');
    const {
      addAttribute,
      addAttributeFromSuggestion,
      suggestions,
      refreshSuggestions,
    } = useAttributes();

    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] =
      useState<AttributeCategory>('dealbreaker');

    const handleAdd = useCallback(async () => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      await addAttribute(trimmed, newCategory);
      setNewName('');
    }, [newName, newCategory, addAttribute]);

    const handleSuggestionTap = useCallback(
      async (name: string) => {
        await addAttributeFromSuggestion(name, newCategory);
      },
      [newCategory, addAttributeFromSuggestion]
    );

    return (
      <View style={styles.addSection}>
        <View style={styles.addInputRow}>
          <TextInput
            style={styles.addInput}
            value={newName}
            onChangeText={setNewName}
            placeholder={t('Add attribute')}
            placeholderTextColor={theme.colors.textMuted}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessibilityLabel={t('Add attribute')}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newName.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAdd}
            disabled={!newName.trim()}
            accessibilityRole="button"
            accessibilityLabel={t('Add')}
          >
            <Text style={styles.addButtonText}>{t('Add')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              newCategory === 'dealbreaker' && styles.categoryChipSelected,
            ]}
            onPress={() => setNewCategory('dealbreaker')}
            accessibilityRole="radio"
            accessibilityLabel={t('Dealbreaker')}
            accessibilityState={{ selected: newCategory === 'dealbreaker' }}
          >
            <Text
              style={[
                styles.categoryChipLabel,
                newCategory === 'dealbreaker' &&
                  styles.categoryChipLabelSelected,
              ]}
            >
              {t('Dealbreaker')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              newCategory === 'desired' && styles.categoryChipSelected,
            ]}
            onPress={() => setNewCategory('desired')}
            accessibilityRole="radio"
            accessibilityLabel={t('Desired')}
            accessibilityState={{ selected: newCategory === 'desired' }}
          >
            <Text
              style={[
                styles.categoryChipLabel,
                newCategory === 'desired' && styles.categoryChipLabelSelected,
              ]}
            >
              {t('Desired')}
            </Text>
          </TouchableOpacity>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>{t('Suggestions')}</Text>
              <TouchableOpacity onPress={refreshSuggestions} accessibilityRole="button" accessibilityLabel={t('Refresh suggestions')}>
                <Ionicons
                  name="refresh"
                  size={18}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.suggestionsRow}>
              {suggestions.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionTap(name)}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                >
                  <Ionicons
                    name="add"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.suggestionChipText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }
);


const AttributesScreen = () => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('settings');
  const router = useRouter();
  const { attributes, removeAttribute, toggleCategory } = useAttributes();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleDelete = useCallback(
    (attr: Attribute) => {
      Alert.alert(
        t('Delete attribute?'),
        t('This will remove "{{name}}" from all prospects.', {
          name: attr.name,
        }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Delete'),
            style: 'destructive',
            onPress: () => removeAttribute(attr.id),
          },
        ]
      );
    },
    [t, removeAttribute]
  );

  const renderAttribute = useCallback(
    ({ item }: { item: Attribute }) => (
      <View style={styles.attributeRow}>
        <Text style={styles.attributeName}>{item.name}</Text>
        <View style={styles.attributeActions}>
          <TouchableOpacity
            style={[
              styles.categoryBadge,
              item.category === 'dealbreaker'
                ? styles.categoryBadgeDealbreaker
                : styles.categoryBadgeDesired,
            ]}
            onPress={() => toggleCategory(item.id)}
            accessibilityRole="button"
            accessibilityLabel={t(item.category === 'dealbreaker' ? 'Dealbreaker' : 'Desired')}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                item.category === 'dealbreaker'
                  ? styles.categoryBadgeTextDealbreaker
                  : styles.categoryBadgeTextDesired,
              ]}
            >
              {t(item.category === 'dealbreaker' ? 'Dealbreaker' : 'Desired')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            accessibilityRole="button"
            accessibilityLabel={`${t('Delete')} ${item.name}`}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [styles, theme, t, toggleCategory, handleDelete]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{t('No attributes yet')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('Tap + to add your first attribute')}
        </Text>
      </View>
    ),
    [styles, t]
  );

  const ListHeaderComponent = useMemo(
    () => <AddAttributeSection styles={styles} theme={theme} />,
    [styles, theme]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('Go back')}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Your Attributes')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={attributes}
          keyExtractor={(item) => item.id}
          renderItem={renderAttribute}
          ListEmptyComponent={ListEmptyComponent}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
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
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: 12,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    headerSpacer: {
      width: 36,
    },
    listContent: {
      padding: 16,
      paddingBottom: 48,
      flexGrow: 1,
    },
    attributeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.backgroundCard,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.md,
      marginBottom: 8,
    },
    attributeName: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    attributeActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    categoryBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      minHeight: 44,
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
    },
    categoryBadgeDealbreaker: {
      backgroundColor: theme.colors.traitNo,
    },
    categoryBadgeDesired: {
      backgroundColor: theme.colors.traitYes,
    },
    categoryBadgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
    },
    categoryBadgeTextDealbreaker: {
      color: theme.colors.traitNoText,
    },
    categoryBadgeTextDesired: {
      color: theme.colors.traitYesText,
    },
    deleteButton: {
      padding: 10,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    flex: {
      flex: 1,
    },
    addSection: {
      marginBottom: 16,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.borderRadius.md,
      padding: 16,
    },
    addInputRow: {
      flexDirection: 'row',
      gap: 8,
    },
    addInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.background,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
    },
    addButtonDisabled: {
      opacity: 0.5,
    },
    addButtonText: {
      color: theme.colors.textOnPrimary,
      fontWeight: '600',
      fontSize: theme.typography.fontSize.base,
    },
    categoryRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    categoryChipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    categoryChipLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    categoryChipLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    suggestionsSection: {
      marginTop: 16,
    },
    suggestionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    suggestionsTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    suggestionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    suggestionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: 44,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    suggestionChipText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
  });

export default AttributesScreen;

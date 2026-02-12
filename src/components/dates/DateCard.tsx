import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, useReduceMotion } from '@/hooks';
import { formatDateLong, getTraitsConfirmedOnDate } from '@/utils/dateHelpers';
import { truncateText } from '@/utils';
import { NOTES_PREVIEW_MAX_LENGTH } from '@/constants';
import { FlameRating } from './FlameRating';
import type { Theme } from '@/theme';
import type { DateEntry, Trait } from '@/types/prospect';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DateCardProps {
  dateEntry: DateEntry;
  traits: Trait[];
  onEdit: (dateEntry: DateEntry) => void;
  onDelete: (dateEntry: DateEntry) => void;
}

export const DateCard: React.FC<DateCardProps> = ({
  dateEntry,
  traits,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation('prospect');
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const [expanded, setExpanded] = useState(false);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const confirmedTraits = useMemo(
    () => getTraitsConfirmedOnDate(traits, new Date(dateEntry.date)),
    [traits, dateEntry.date]
  );

  const toggleExpanded = () => {
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleExpanded}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Date on ${formatDateLong(new Date(dateEntry.date))}${dateEntry.location ? ` at ${dateEntry.location}` : ''}`}
      accessibilityHint={expanded ? 'Tap to collapse' : 'Tap to expand'}
    >
      {/* Header with date and expand button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {formatDateLong(new Date(dateEntry.date))}
            </Text>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={toggleExpanded}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={expanded ? t('Collapse details') : t('Expand details')}
            >
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Location */}
          {dateEntry.location && (
            <Text style={styles.location}>{dateEntry.location}</Text>
          )}

          {/* Notes - preview or full */}
          {dateEntry.notes && (
            <Text style={expanded ? styles.notesFull : styles.notesPreview}>
              {expanded ? dateEntry.notes : truncateText(dateEntry.notes, NOTES_PREVIEW_MAX_LENGTH)}
            </Text>
          )}
        </View>
      </View>

      {/* Rating - at bottom of card */}
      {dateEntry.rating && (
        <View style={styles.ratingRow}>
          <FlameRating value={dateEntry.rating} displayOnly size="xs" />
        </View>
      )}

      {/* Expanded content */}
      {expanded && (
        <>
          {/* Confirmed traits */}
          {confirmedTraits.length > 0 && (
            <View style={styles.traitsSection}>
              <Text style={styles.traitsLabel}>{t('Traits Confirmed')}</Text>
              <View style={styles.traitsContainer}>
                {confirmedTraits.map((trait) => (
                  <View key={trait.id} style={styles.traitChip}>
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={theme.colors.traitYesText}
                    />
                    <Text style={styles.traitChipText}>
                      {trait.attributeName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(dateEntry)}
              accessibilityRole="button"
              accessibilityLabel={t('Edit date')}
            >
              <Ionicons
                name="pencil"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.actionText}>{t('Edit Date')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(dateEntry)}
              accessibilityRole="button"
              accessibilityLabel={t('Delete date')}
            >
              <Ionicons name="trash" size={16} color={theme.colors.error} />
              <Text style={[styles.actionText, styles.deleteText]}>
                {t('Delete Date')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flex: 1,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dateText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    expandButton: {
      padding: 10,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ratingRow: {
      marginTop: 12,
    },
    location: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    notesPreview: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.sm * 1.4,
    },
    notesFull: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      lineHeight: theme.typography.fontSize.base * 1.5,
      marginTop: 8,
    },
    traitsSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    traitsLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    traitsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    traitChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.traitYes,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    traitChipText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '500',
      color: theme.colors.traitYesText,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minHeight: 44,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    actionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    deleteText: {
      color: theme.colors.error,
    },
  });

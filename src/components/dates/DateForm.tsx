import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks';
import { formatDateLong } from '@/utils/dateHelpers';
import { FlameRating } from './FlameRating';
import { TraitEvaluationCTA } from './TraitEvaluationCTA';
import type { Theme } from '@/theme';
import type { DateEntry } from '@/types/prospect';

interface DateFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: DateFormData) => Promise<void>;
  onNavigateToTraits: () => void;
  initialData?: DateEntry;
  isEditing?: boolean;
}

export interface DateFormData {
  date: Date;
  location?: string;
  rating?: number;
  notes?: string;
}

export const DateForm: React.FC<DateFormProps> = ({
  visible,
  onClose,
  onSave,
  onNavigateToTraits,
  initialData,
  isEditing = false,
}) => {
  const { t } = useTranslation('prospect');
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [date, setDate] = useState<Date>(
    initialData ? new Date(initialData.date) : new Date()
  );
  const [location, setLocation] = useState(initialData?.location || '');
  const [rating, setRating] = useState<number | undefined>(initialData?.rating);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when initialData changes
  useEffect(() => {
    if (visible) {
      setDate(initialData ? new Date(initialData.date) : new Date());
      setLocation(initialData?.location || '');
      setRating(initialData?.rating);
      setNotes(initialData?.notes || '');
    }
  }, [visible, initialData]);

  const handleSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        date,
        location: location.trim() || undefined,
        rating: rating || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  isSubmitting && styles.headerButtonDisabled,
                ]}
              >
                {t('common:Cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? t('Edit Date') : t('Log a Date')}
            </Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={styles.headerButtonText}>{t('common:Save')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Date picker */}
            <View style={styles.section}>
              <Text style={styles.label}>
                {t('Date')} <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.dateButtonText}>{formatDateLong(date)}</Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('Location')} (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder={t('Where did you go?')}
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('Rating')} (optional)</Text>
              <FlameRating value={rating} onChange={setRating} size="lg" />
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('Notes')} (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('How did it go?')}
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Trait Evaluation CTA */}
            <View style={styles.ctaContainer}>
              <TraitEvaluationCTA onPress={onNavigateToTraits} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    headerButtonText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    headerButtonDisabled: {
      opacity: 0.5,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    content: {
      padding: 24,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    required: {
      color: theme.colors.error,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.borderRadius.md,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dateButtonText: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      marginLeft: 8,
    },
    textInput: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.borderRadius.md,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    multilineInput: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    ctaContainer: {
      marginTop: 16,
    },
  });

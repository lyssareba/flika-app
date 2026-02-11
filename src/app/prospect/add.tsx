import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeContext, type Theme } from '@/theme';
import { useProspects } from '@/hooks';
import { useTranslation } from 'react-i18next';

type HowWeMet = 'dating_app' | 'friends' | 'work' | 'school' | 'event' | 'other';

const HOW_WE_MET_OPTIONS: { value: HowWeMet; labelKey: string }[] = [
  { value: 'dating_app', labelKey: 'Dating app' },
  { value: 'friends', labelKey: 'Through friends' },
  { value: 'work', labelKey: 'Work' },
  { value: 'school', labelKey: 'School' },
  { value: 'event', labelKey: 'Event' },
  { value: 'other', labelKey: 'Other' },
];

const AddProspectScreen = () => {
  const router = useRouter();
  const { theme } = useThemeContext();
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const { addProspect } = useProspects();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Form state
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [howWeMet, setHowWeMet] = useState<HowWeMet | undefined>();
  const [hasMetInPerson, setHasMetInPerson] = useState<boolean | undefined>();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim().length > 0 && hasMetInPerson !== undefined;

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        tc('Permission needed'),
        tc('Please allow access to your photo library to add a photo.')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, [tc]);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        tc('Permission needed'),
        tc('Please allow access to your camera to take a photo.')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, [tc]);

  const handlePhotoPress = useCallback(() => {
    Alert.alert(t('Add Photo'), undefined, [
      { text: tc('Camera'), onPress: handleTakePhoto },
      { text: tc('Photo Library'), onPress: handlePickImage },
      { text: tc('Cancel'), style: 'cancel' },
    ]);
  }, [t, tc, handleTakePhoto, handlePickImage]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const id = await addProspect({
        name: name.trim(),
        photoUri,
        howWeMet,
        notes: notes.trim() || undefined,
        hasMetInPerson: hasMetInPerson!,
      });
      router.replace(`/prospect/${id}`);
    } catch (error) {
      console.error('Error adding prospect:', error);
      Alert.alert(tc('Error'), tc('Failed to add prospect. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, addProspect, name, photoUri, howWeMet, notes, hasMetInPerson, router, tc]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={tc('Go back')}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Add Someone New')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('Photo')} <Text style={styles.optional}>({t('optional')})</Text>
            </Text>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handlePhotoPress}
              accessibilityRole="button"
              accessibilityLabel={t('Add Photo')}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color={theme.colors.textMuted} />
                  <Text style={styles.photoPlaceholderText}>{t('Add Photo')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('Name')}</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={tc('Enter name')}
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* How We Met */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('How you met')} <Text style={styles.optional}>({t('optional')})</Text>
            </Text>
            <View style={styles.optionsGrid}>
              {HOW_WE_MET_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    howWeMet === option.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => setHowWeMet(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: howWeMet === option.value }}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      howWeMet === option.value && styles.optionButtonTextSelected,
                    ]}
                  >
                    {t(option.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Met In Person */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('Have you met in person yet?')}</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  styles.toggleButtonLeft,
                  hasMetInPerson === false && styles.toggleButtonSelected,
                ]}
                onPress={() => setHasMetInPerson(false)}
                accessibilityRole="button"
                accessibilityState={{ selected: hasMetInPerson === false }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    hasMetInPerson === false && styles.toggleButtonTextSelected,
                  ]}
                >
                  {t('Not yet')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  styles.toggleButtonRight,
                  hasMetInPerson === true && styles.toggleButtonSelected,
                ]}
                onPress={() => setHasMetInPerson(true)}
                accessibilityRole="button"
                accessibilityState={{ selected: hasMetInPerson === true }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    hasMetInPerson === true && styles.toggleButtonTextSelected,
                  ]}
                >
                  {tc('Yes')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('Notes')} <Text style={styles.optional}>({t('optional')})</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder={tc('Add any notes...')}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={t('Add Person')}
            accessibilityState={{ disabled: !isValid || isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.textOnPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>{t('Add Person')}</Text>
            )}
          </TouchableOpacity>
        </View>
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
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundCard,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      flex: 1,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 24,
    },
    section: {
      gap: 8,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    optional: {
      fontWeight: '400',
      color: theme.colors.textMuted,
    },
    photoContainer: {
      alignSelf: 'center',
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
    },
    photo: {
      width: 120,
      height: 120,
    },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.backgroundCard,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.textMuted,
      borderStyle: 'dashed',
    },
    photoPlaceholderText: {
      marginTop: 4,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    textInput: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    textInputMultiline: {
      minHeight: 100,
      paddingTop: 14,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.backgroundCard,
    },
    optionButtonSelected: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    optionButtonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    optionButtonTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    toggleContainer: {
      flexDirection: 'row',
      borderRadius: 12,
      overflow: 'hidden',
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 14,
      backgroundColor: theme.colors.backgroundCard,
      alignItems: 'center',
    },
    toggleButtonLeft: {
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
      borderRightWidth: 1,
      borderRightColor: theme.colors.background,
    },
    toggleButtonRight: {
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    toggleButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    toggleButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    toggleButtonTextSelected: {
      color: theme.colors.textOnPrimary,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.backgroundCard,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  });

export default AddProspectScreen;

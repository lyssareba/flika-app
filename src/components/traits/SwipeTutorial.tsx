import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface SwipeTutorialProps {
  visible: boolean;
  onDismiss: () => void;
}

export const SwipeTutorial: React.FC<SwipeTutorialProps> = ({
  visible,
  onDismiss,
}) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconRow}>
          <View style={styles.instructionItem}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.traitNoText} />
            <Text style={styles.instructionText}>{t('Swipe left = No')}</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.traitYesText} />
            <Text style={styles.instructionText}>{t('Swipe right = Yes')}</Text>
          </View>
        </View>
        <View style={styles.tapInstruction}>
          <Ionicons name="finger-print" size={18} color={theme.colors.textMuted} />
          <Text style={styles.tapText}>{t('Tap = Reset to unknown')}</Text>
        </View>
        <View style={styles.tapInstruction}>
          <Ionicons name="menu" size={18} color={theme.colors.textMuted} />
          <Text style={styles.tapText}>{t('Long press for options')}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel={t('Got it')}
      >
        <Text style={styles.dismissText}>{t('Got it')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    content: {
      gap: 12,
    },
    iconRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    instructionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    instructionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    tapInstruction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    tapText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    dismissButton: {
      alignSelf: 'center',
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
    },
    dismissText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  });

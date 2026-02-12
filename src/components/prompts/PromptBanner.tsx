import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';
import { FlikaMascot } from '@/components/mascot';
import type { InAppPrompt, PromptType } from '@/types';

interface PromptBannerProps {
  prompt: InAppPrompt;
  onDismiss: (prompt: InAppPrompt) => void;
  onPress?: (prompt: InAppPrompt) => void;
}

const getBackgroundColor = (type: PromptType, theme: Theme): string => {
  switch (type) {
    case 'date_reminder':
      return theme.colors.info + '15';
    case 'dealbreaker_check':
      return theme.colors.warning + '15';
    case 'milestone':
      return theme.colors.accent + '20';
    case 'general_tip':
      return theme.colors.primary + '15';
  }
};

export const PromptBanner = ({ prompt, onDismiss, onPress }: PromptBannerProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const backgroundColor = getBackgroundColor(prompt.type, theme);
  const message = t(prompt.messageKey, prompt.messageParams ?? {});

  const content = (
    <View style={[styles.container, { backgroundColor }]}>
      <FlikaMascot state={prompt.mascotState} size={32} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        onPress={() => onDismiss(prompt)}
        style={styles.dismissButton}
        accessibilityRole="button"
        accessibilityLabel={t('common:Dismiss')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => onPress(prompt)}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
    },
    message: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textPrimary,
      lineHeight: 20,
    },
    dismissButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

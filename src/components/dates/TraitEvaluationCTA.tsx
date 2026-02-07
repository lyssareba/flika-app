import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks';
import type { Theme } from '@/theme';

interface TraitEvaluationCTAProps {
  onPress: () => void;
}

export const TraitEvaluationCTA: React.FC<TraitEvaluationCTAProps> = ({
  onPress,
}) => {
  const { t } = useTranslation('prospect');
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t('Any traits confirmed?')}
      accessibilityHint="Navigate to trait evaluation screen"
    >
      <View style={styles.iconContainer}>
        <Ionicons name="flame" size={18} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{t('Any traits confirmed?')}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '15', // 15 = ~8% opacity
      borderRadius: theme.borderRadius.md,
      padding: 16,
      gap: 12,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textContainer: {
      flex: 1,
    },
    text: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    arrow: {
      marginLeft: 4,
    },
  });

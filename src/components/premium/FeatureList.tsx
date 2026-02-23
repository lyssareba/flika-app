import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';

interface FeatureListProps {
  features: string[];
}

export const FeatureList = ({ features }: FeatureListProps) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('premium');
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {features.map((featureKey) => (
        <View key={featureKey} style={styles.row}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.success}
          />
          <Text style={styles.featureText}>{t(featureKey)}</Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing[3],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    featureText: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.textPrimary,
      flex: 1,
    },
  });

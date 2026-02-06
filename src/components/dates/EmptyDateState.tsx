import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks';
import { Button } from '@/components/ui/Button/Button';

interface EmptyDateStateProps {
  prospectName: string;
  onAddDate: () => void;
}

export const EmptyDateState: React.FC<EmptyDateStateProps> = ({
  prospectName,
  onAddDate,
}) => {
  const { t } = useTranslation('prospect');
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          paddingVertical: 48,
        },
        iconContainer: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.peach,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        },
        title: {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: '600',
          color: theme.colors.textPrimary,
          marginBottom: 8,
          textAlign: 'center',
        },
        subtitle: {
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: 32,
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="calendar-outline"
          size={40}
          color={theme.colors.primary}
        />
      </View>
      <Text style={styles.title}>{t('No dates yet')}</Text>
      <Text style={styles.subtitle}>
        {t('Log your first date with {{name}}', { name: prospectName })}
      </Text>
      <Button title={t('Log a Date')} onPress={onAddDate} />
    </View>
  );
};

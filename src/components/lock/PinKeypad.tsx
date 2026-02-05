import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface PinKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  disabled?: boolean;
  deleteDisabled?: boolean;
}

export const PinKeypad = ({
  onDigit,
  onDelete,
  onBiometric,
  disabled = false,
  deleteDisabled = false,
}: PinKeypadProps) => {
  const { t } = useTranslation('common');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [onBiometric ? 'biometric' : '', '0', 'delete'],
  ];

  return (
    <View style={styles.keypad}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keypadRow}>
          {row.map((key) => {
            if (key === '') {
              return <View key="empty" style={styles.keyEmpty} />;
            }

            if (key === 'biometric') {
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={onBiometric}
                  disabled={disabled}
                  accessibilityLabel={t('Unlock with biometrics')}
                >
                  <Ionicons
                    name="finger-print"
                    size={28}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              );
            }

            if (key === 'delete') {
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={onDelete}
                  disabled={deleteDisabled || disabled}
                  accessibilityLabel={t('Delete')}
                >
                  <Ionicons
                    name="backspace-outline"
                    size={28}
                    color={
                      deleteDisabled
                        ? theme.colors.textMuted
                        : theme.colors.textPrimary
                    }
                  />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => onDigit(key)}
                disabled={disabled}
                accessibilityLabel={key}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    keypad: {
      gap: 12,
    },
    keypadRow: {
      flexDirection: 'row',
      gap: 24,
    },
    key: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.backgroundCard,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    keyEmpty: {
      width: 72,
      height: 72,
    },
    keyText: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
  });
};

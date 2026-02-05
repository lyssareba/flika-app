import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme';
import { useAppLock } from '@/hooks/useAppLock';
import { useTranslation } from 'react-i18next';

const PIN_LENGTH = 4;

export function LockScreen() {
  const { t } = useTranslation('common');
  const { theme } = useThemeContext();
  const { unlockWithPin, unlockWithBiometric, isBiometricEnabled, isBiometricAvailable } =
    useAppLock();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const canUseBiometric = isBiometricEnabled && isBiometricAvailable;

  // Attempt biometric on mount
  useEffect(() => {
    if (canUseBiometric) {
      unlockWithBiometric();
    }
  }, [canUseBiometric, unlockWithBiometric]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleDigit = useCallback(
    async (digit: string) => {
      if (pin.length >= PIN_LENGTH) return;

      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === PIN_LENGTH) {
        const success = await unlockWithPin(newPin);
        if (!success) {
          setError(true);
          Vibration.vibrate(200);
          shake();
          // Clear after a short delay so user sees all dots filled
          setTimeout(() => setPin(''), 300);
        }
      }
    },
    [pin, unlockWithPin, shake]
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const styles = createStyles(theme, error);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={40} color={theme.colors.primary} />
        <Text style={styles.title}>{t('Flika is locked')}</Text>
        <Text style={styles.subtitle}>
          {error ? t('Wrong PIN, try again') : t('Enter your PIN to unlock')}
        </Text>
      </View>

      <Animated.View
        style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          [canUseBiometric ? 'biometric' : '', '0', 'delete'],
        ].map((row, rowIndex) => (
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
                    onPress={unlockWithBiometric}
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
                    onPress={handleDelete}
                    disabled={pin.length === 0}
                    accessibilityLabel={t('Delete')}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={28}
                      color={pin.length === 0 ? theme.colors.textMuted : theme.colors.textPrimary}
                    />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handleDigit(key)}
                  accessibilityLabel={key}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof import('@/theme').createTheme>, hasError: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 16,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: hasError ? theme.colors.error : theme.colors.textSecondary,
      marginTop: 8,
    },
    dotsContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 48,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
    dotFilled: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dotError: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
    },
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
}

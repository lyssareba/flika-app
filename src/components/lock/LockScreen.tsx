import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useAppLock } from '@/hooks/useAppLock';
import { useTranslation } from 'react-i18next';
import { PinKeypad } from './PinKeypad';

const PIN_LENGTH = 4;

export const LockScreen = () => {
  const { t } = useTranslation('common');
  const { theme } = useThemeContext();
  const { unlockWithPin, unlockWithBiometric, isBiometricEnabled, isBiometricAvailable } =
    useAppLock();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
      if (verifying) return;

      setPin((prev) => {
        if (prev.length >= PIN_LENGTH) return prev;
        return prev + digit;
      });
      setError(false);
    },
    [verifying]
  );

  // Verify PIN when it reaches full length
  useEffect(() => {
    if (pin.length !== PIN_LENGTH || verifying) return;

    setVerifying(true);
    unlockWithPin(pin).then((success) => {
      if (!success) {
        setError(true);
        Vibration.vibrate(200);
        shake();
        setTimeout(() => {
          setPin('');
          setVerifying(false);
        }, 300);
      }
    });
  }, [pin, verifying, unlockWithPin, shake]);

  const handleDelete = useCallback(() => {
    if (verifying) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, [verifying]);

  const styles = useMemo(() => createStyles(theme, error), [theme, error]);

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

      <PinKeypad
        onDigit={handleDigit}
        onDelete={handleDelete}
        onBiometric={canUseBiometric ? unlockWithBiometric : undefined}
        disabled={verifying}
        deleteDisabled={pin.length === 0}
      />
    </View>
  );
};

const createStyles = (theme: Theme, hasError: boolean) => {
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
  });
};

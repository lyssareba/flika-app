import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Animated,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useAppLock } from '@/hooks';
import { PinKeypad } from '@/components/lock';

const PIN_LENGTH = 4;

type PinState = 'idle' | 'entering' | 'confirming' | 'done' | 'error';

interface SecurityStepProps {
  onComplete: () => Promise<void>;
  onBack: () => void;
}

export const SecurityStep = ({ onComplete, onBack }: SecurityStepProps) => {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
  const { theme } = useThemeContext();
  const { setupPin, enableAppLock, enableBiometric, isBiometricAvailable } = useAppLock();

  const [pinState, setPinState] = useState<PinState>('idle');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const completingRef = useRef(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Clean up error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const processFullPin = useCallback(
    async (fullPin: string) => {
      if (pinState === 'entering') {
        setFirstPin(fullPin);
        setPin('');
        setPinState('confirming');
      } else if (pinState === 'confirming') {
        setPin('');
        if (fullPin === firstPin) {
          await setupPin(fullPin);
          await enableAppLock(true);
          setPinState('done');
        } else {
          setPinState('error');
          Vibration.vibrate(200);
          shake();
          errorTimeoutRef.current = setTimeout(() => {
            setFirstPin('');
            setPinState('entering');
          }, 300);
        }
      }
    },
    [pinState, firstPin, setupPin, enableAppLock, shake]
  );

  // Trigger processFullPin when PIN reaches full length
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      processFullPin(pin);
    }
  }, [pin, processFullPin]);

  const handleDigit = useCallback(
    (digit: string) => {
      setPin((prev) => {
        if (prev.length >= PIN_LENGTH) return prev;
        return prev + digit;
      });
    },
    []
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleStartPin = () => {
    setPinState('entering');
    setPin('');
    setFirstPin('');
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    setBiometricEnabled(enabled);
    await enableBiometric(enabled);
  };

  const handleFinish = () => {
    if (completingRef.current) return;
    completingRef.current = true;
    onComplete().catch(() => {
      completingRef.current = false;
    });
  };

  // During onboarding, only use local pinState — ignore hasPinSet from SecureStore
  // to avoid showing success from stale data from previous sessions
  const pinDone = pinState === 'done';

  const getPromptText = () => {
    switch (pinState) {
      case 'entering':
        return t('Enter a 4-digit PIN');
      case 'confirming':
        return t('Confirm your PIN');
      case 'error':
        return t("PINs don't match. Try again.");
      case 'done':
        return t('PIN set successfully!');
      default:
        return '';
    }
  };

  // PIN entry view
  if (pinState === 'entering' || pinState === 'confirming' || pinState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pinHeader}>
          <TouchableOpacity
            onPress={() => {
              setPinState('idle');
              setPin('');
              setFirstPin('');
            }}
            accessibilityLabel={tc('Back')}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.pinContent}>
          <Text style={[styles.pinPrompt, pinState === 'error' && styles.pinPromptError]}>
            {getPromptText()}
          </Text>

          <Animated.View
            style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < pin.length && styles.dotFilled,
                  pinState === 'error' && styles.dotError,
                ]}
              />
            ))}
          </Animated.View>

          <PinKeypad
            onDigit={handleDigit}
            onDelete={handleDelete}
            disabled={pinState === 'error'}
            deleteDisabled={pin.length === 0}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Main security step view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityLabel={tc('Back')}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('Protect Your Data')}</Text>
        <Text style={styles.subtitle}>
          {t('Add an extra layer of privacy to keep your dating notes safe.')}
        </Text>
      </View>

      <View style={styles.optionsSection}>
        {pinDone ? (
          <View style={styles.optionCard}>
            <View style={styles.optionRow}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.optionLabel}>{t('PIN set successfully!')}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.optionCard} onPress={handleStartPin}>
            <View style={styles.optionRow}>
              <Ionicons name="keypad" size={24} color={theme.colors.primary} />
              <Text style={styles.optionLabel}>{t('Set Up PIN')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}

        {isBiometricAvailable && pinDone && (
          <View style={styles.optionCard}>
            <View style={styles.optionRow}>
              <Ionicons name="finger-print" size={24} color={theme.colors.primary} />
              <View>
                <Text style={styles.optionLabel}>{t('Enable Biometrics')}</Text>
                <Text style={styles.optionHint}>
                  {t('Use fingerprint or face recognition to unlock')}
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.skipHint}>
          {t('You can always set this up later in Settings.')}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleFinish}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{tc('Finish')}</Text>
        </TouchableOpacity>
        {!pinDone && (
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={handleFinish}
            disabled={false}
            accessibilityRole="button"
          >
            <Text style={styles.ghostButtonText}>{t('Skip for now')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 16,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    optionsSection: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 32,
      gap: 12,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: 16,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    optionLabel: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    optionHint: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 12,
    },
    skipHint: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
    },
    ghostButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    ghostButtonText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
    },
    // PIN entry styles
    pinHeader: {
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    pinContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    pinPrompt: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 32,
    },
    pinPromptError: {
      color: theme.colors.error,
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

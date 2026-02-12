import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeContext, type Theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { FlikaMascot } from '@/components/mascot';
import { MIN_PASSWORD_LENGTH } from '@/constants';
import { isNotEmpty, isValidPassword, passwordsMatch } from '@/utils';

type AuthView = 'welcome' | 'signIn' | 'signUp' | 'forgotPassword';

export const AuthScreen = () => {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation('common');
  const { theme } = useThemeContext();
  const { signIn, signUp, resetPassword } = useAuth();

  const [view, setView] = useState<AuthView>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const isSignUpFormValid =
    isNotEmpty(displayName) &&
    isNotEmpty(email) &&
    password &&
    confirmPassword &&
    passwordsMatch(password, confirmPassword) &&
    isValidPassword(password);

  const clearForm = () => {
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError(null);
    setResetSent(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError(tc('Please fill in all fields'));
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      clearForm();
      setEmail('');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, tc));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setError(tc('Please fill in all fields'));
      return;
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setError(tc('Passwords do not match'));
      return;
    }
    if (!isValidPassword(password)) {
      setError(tc('Password must be at least {{count}} characters', { count: MIN_PASSWORD_LENGTH }));
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password, displayName.trim());
      clearForm();
      setEmail('');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, tc));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError(tc('Please enter your email'));
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, tc));
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    clearForm();
  };

  if (view === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          <FlikaMascot state="happy" size={80} accessibilityLabel="Flika mascot" />
          <Text style={styles.appTitle}>Flika</Text>
          <Text style={styles.tagline}>
            {t("Your dating companion that helps you find what you're really looking for.")}
          </Text>
        </View>

        <View style={styles.welcomeActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => switchView('signUp')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{t('Get Started')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => switchView('signIn')}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>{t('Already have an account?')}</Text>
            <Text style={styles.linkAction}>{tc('Sign In')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (view === 'forgotPassword') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => switchView('signIn')}
              accessibilityLabel={tc('Back')}
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.formTitle}>{tc('Reset Password')}</Text>
            <Text style={styles.formSubtitle}>
              {tc("Enter your email and we'll send you a reset link")}
            </Text>

            {resetSent ? (
              <>
                <View style={styles.successBox} accessibilityRole="alert">
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                  <Text style={styles.successText}>
                    {tc('Password reset email sent. Check your inbox.')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => switchView('signIn')}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryButtonText}>{tc('Back to Sign In')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder={t('Email')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="go"
                  onSubmitEditing={handleResetPassword}
                  accessibilityLabel={t('Email')}
                />

                {error && <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text>}

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{tc('Send Reset Link')}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // Sign In / Sign Up forms
  const isSignUp = view === 'signUp';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => switchView('welcome')}
            accessibilityLabel={tc('Back')}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.formTitle}>
            {isSignUp ? t('Create Account') : tc('Sign In')}
          </Text>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder={t('Full Name')}
              placeholderTextColor={theme.colors.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              accessibilityLabel={t('Full Name')}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder={t('Email')}
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            accessibilityLabel={t('Email')}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('Password')}
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              returnKeyType={isSignUp ? 'next' : 'go'}
              onSubmitEditing={isSignUp ? undefined : handleSignIn}
              accessibilityLabel={t('Password')}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? tc('Hide password') : tc('Show password')}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('Confirm Password')}
                placeholderTextColor={theme.colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                returnKeyType="go"
                onSubmitEditing={handleSignUp}
                accessibilityLabel={t('Confirm Password')}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                accessibilityLabel={showConfirmPassword ? tc('Hide password') : tc('Show password')}
                accessibilityRole="button"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          {isSignUp && confirmPassword && password !== confirmPassword && (
            <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{tc('Passwords do not match')}</Text>
          )}

          {error && <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text>}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (loading || (isSignUp && !isSignUpFormValid)) && styles.buttonDisabled,
            ]}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={loading || (isSignUp && !isSignUpFormValid)}
            accessibilityRole="button"
            accessibilityState={{ disabled: loading || (isSignUp && !isSignUpFormValid) }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? t('Create Account') : tc('Sign In')}
              </Text>
            )}
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => switchView('forgotPassword')}
              accessibilityRole="button"
            >
              <Text style={styles.forgotPasswordText}>{tc('Forgot password?')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isSignUp ? tc('Already have an account?') : tc("Don't have an account?")}
            </Text>
            <TouchableOpacity onPress={() => switchView(isSignUp ? 'signIn' : 'signUp')} accessibilityRole="button">
              <Text style={styles.switchAction}>
                {isSignUp ? tc('Sign In') : tc('Sign Up')}
              </Text>
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <Text style={styles.termsText}>
              {t('By continuing, you agree to our')}{' '}
              <Text style={styles.termsLink}>{tc('Terms of Service')}</Text>
              {' '}{t('and')}{' '}
              <Text style={styles.termsLink}>{tc('Privacy Policy')}</Text>
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const getAuthErrorMessage = (err: unknown, t: (key: string, options?: Record<string, unknown>) => string): string => {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return t('This email is already registered');
    case 'auth/invalid-email':
      return t('Invalid email address');
    case 'auth/weak-password':
      return t('Password must be at least {{count}} characters', { count: MIN_PASSWORD_LENGTH });
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return t('Invalid email or password');
    case 'auth/user-disabled':
      return t('This account has been disabled');
    case 'auth/too-many-requests':
      return t('Too many attempts. Please try again later.');
    case 'auth/network-request-failed':
      return t('Network error. Check your connection.');
    default:
      return t('Something went wrong. Please try again.');
  }
};

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    welcomeContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    appTitle: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 16,
    },
    tagline: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 26,
    },
    welcomeActions: {
      paddingHorizontal: 32,
      paddingBottom: 24,
      gap: 16,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    linkContainer: {
      alignItems: 'center',
      gap: 4,
    },
    linkText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
    },
    linkAction: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    formContainer: {
      flexGrow: 1,
      paddingHorizontal: 32,
      paddingTop: 16,
      paddingBottom: 32,
    },
    backButton: {
      marginBottom: 24,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
    },
    formTitle: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 24,
    },
    formSubtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
    },
    input: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    passwordToggle: {
      paddingHorizontal: 12,
      paddingVertical: 14,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
      marginBottom: 12,
    },
    forgotPassword: {
      alignItems: 'center',
      marginTop: 12,
    },
    forgotPasswordText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      marginTop: 24,
    },
    switchText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
    },
    switchAction: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    termsText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 24,
      lineHeight: 18,
    },
    termsLink: {
      color: theme.colors.primary,
    },
    successBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      marginBottom: 16,
    },
    successText: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
  });
};

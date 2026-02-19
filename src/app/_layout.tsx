import { View, StyleSheet, Text as RNText, TextInput as RNTextInput } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useThemeContext } from '@/theme';
import {
  AppLockProvider,
  AttributesProvider,
  AuthProvider,
  PremiumProvider,
  ProspectsProvider,
} from '@/context';
import { LockScreen } from '@/components/lock';
import { OnboardingFlow } from '@/components/onboarding';
import { useAppLock } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/auth';

// Initialize i18n - import triggers initialization
import '@/i18n';

// Limit font scaling to 1.5x to prevent layout breakage
// @ts-expect-error -- defaultProps deprecated but functional in RN
RNText.defaultProps = { ...(RNText.defaultProps || {}), maxFontSizeMultiplier: 1.5 };
// @ts-expect-error -- defaultProps deprecated but functional in RN
RNTextInput.defaultProps = { ...(RNTextInput.defaultProps || {}), maxFontSizeMultiplier: 1.5 };

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
  },
});

const AppContent = () => {
  const { theme } = useThemeContext();
  const { isLocked } = useAppLock();
  const { userProfile, refreshProfile } = useAuth();

  if (isLocked) {
    return <LockScreen />;
  }

  if (!userProfile?.onboardingCompleted) {
    return <OnboardingFlow onComplete={refreshProfile} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        navigationBarColor: theme.colors.background,
      }}
    />
  );
};

const AuthGate = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // While checking auth state, render nothing (splash screen covers this)
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  // Authenticated → premium → app lock → attributes → prospects → main app
  return (
    <PremiumProvider>
      <AppLockProvider userId={user.uid}>
        <AttributesProvider>
          <ProspectsProvider>
            <AppContent />
          </ProspectsProvider>
        </AttributesProvider>
      </AppLockProvider>
    </PremiumProvider>
  );
};

const RootLayoutNav = () => {
  const { theme, effectiveMode } = useThemeContext();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={effectiveMode === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;

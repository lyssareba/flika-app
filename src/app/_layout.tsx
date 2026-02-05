import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/theme';
import {
  AppLockProvider,
  AttributesProvider,
  AuthProvider,
  ProspectsProvider,
} from '@/context';
import { LockScreen } from '@/components/lock';
import { OnboardingFlow } from '@/components/onboarding';
import { useAppLock } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/auth';

// Initialize i18n - import triggers initialization
import '@/i18n';

const AppContent = () => {
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

  // Authenticated → app lock check → attributes → prospects → main app
  return (
    <AppLockProvider userId={user.uid}>
      <AttributesProvider>
        <ProspectsProvider>
          <AppContent />
        </ProspectsProvider>
      </AttributesProvider>
    </AppLockProvider>
  );
};

const RootLayoutNav = () => {
  const { effectiveMode } = useThemeContext();

  return (
    <>
      <StatusBar style={effectiveMode === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </>
  );
};

const RootLayout = () => {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
};

export default RootLayout;

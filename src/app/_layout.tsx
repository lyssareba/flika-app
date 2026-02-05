import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/theme';
import { AppLockProvider, AuthProvider } from '@/context';
import { LockScreen } from '@/components/lock';
import { useAppLock } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from './auth';

// Initialize i18n - import triggers initialization
import '@/i18n';

function AppContent() {
  const { isLocked } = useAppLock();

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  // While checking auth state, render nothing (splash screen covers this)
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Authenticated → app lock check → main app
  return (
    <AppLockProvider>
      <AppContent />
    </AppLockProvider>
  );
}

function RootLayoutNav() {
  const { effectiveMode } = useThemeContext();

  return (
    <>
      <StatusBar style={effectiveMode === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

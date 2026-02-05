import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/theme';
import { AppLockProvider } from '@/context';
import { LockScreen } from '@/components/lock';
import { useAppLock } from '@/hooks';

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

function RootLayoutNav() {
  const { effectiveMode } = useThemeContext();

  return (
    <>
      <StatusBar style={effectiveMode === 'dark' ? 'light' : 'dark'} />
      <AppLockProvider>
        <AppContent />
      </AppLockProvider>
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

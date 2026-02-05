import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import i18n from 'i18next';
import {
  getAppLockEnabled,
  getBiometricEnabled,
  setLastActiveTimestamp,
  hasLockTimeoutElapsed,
  verifyPin,
  getPinHash,
} from '@/services/storage';

interface AppLockContextType {
  isLocked: boolean;
  isAppLockEnabled: boolean;
  isBiometricEnabled: boolean;
  isBiometricAvailable: boolean;
  hasPinSet: boolean;
  lock: () => void;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  refreshConfig: () => Promise<void>;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export const AppLockProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useRef(AppState.currentState);
  const isAppLockEnabledRef = useRef(isAppLockEnabled);

  // Keep ref in sync with state
  useEffect(() => {
    isAppLockEnabledRef.current = isAppLockEnabled;
  }, [isAppLockEnabled]);

  // Load configuration from storage
  const loadConfig = useCallback(async () => {
    const [lockEnabled, bioEnabled, pinHash, bioAvailable] = await Promise.all([
      getAppLockEnabled(),
      getBiometricEnabled(),
      getPinHash(),
      LocalAuthentication.hasHardwareAsync(),
    ]);

    setIsAppLockEnabled(lockEnabled);
    setIsBiometricEnabled(bioEnabled);
    setHasPinSet(!!pinHash);
    setIsBiometricAvailable(bioAvailable);

    return { lockEnabled };
  }, []);

  const refreshConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  // Initialize on mount
  useEffect(() => {
    async function init() {
      const { lockEnabled } = await loadConfig();

      // Lock on cold start if enabled
      if (lockEnabled) {
        setIsLocked(true);
      }

      setIsInitialized(true);
    }

    init();
  }, [loadConfig]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        // App going to background → record timestamp
        if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
          await setLastActiveTimestamp();
        }

        // App coming to foreground → check if should lock
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          if (isAppLockEnabledRef.current) {
            const shouldLock = await hasLockTimeoutElapsed();
            if (shouldLock) {
              setIsLocked(true);
            }
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockWithPin = useCallback(async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setIsLocked(false);
    }
    return isValid;
  }, []);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!isBiometricEnabled || !isBiometricAvailable) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: i18n.t('common:Unlock Flika'),
        fallbackLabel: i18n.t('common:Use PIN'),
        disableDeviceFallback: true,
      });

      if (result.success) {
        setIsLocked(false);
      }

      return result.success;
    } catch {
      return false;
    }
  }, [isBiometricEnabled, isBiometricAvailable]);

  const value = useMemo(
    () => ({
      isLocked,
      isAppLockEnabled,
      isBiometricEnabled,
      isBiometricAvailable,
      hasPinSet,
      lock,
      unlockWithPin,
      unlockWithBiometric,
      refreshConfig,
    }),
    [
      isLocked,
      isAppLockEnabled,
      isBiometricEnabled,
      isBiometricAvailable,
      hasPinSet,
      lock,
      unlockWithPin,
      unlockWithBiometric,
      refreshConfig,
    ]
  );

  // Don't render children until config is loaded
  if (!isInitialized) {
    return null;
  }

  return (
    <AppLockContext.Provider value={value}>
      {children}
    </AppLockContext.Provider>
  );
};

export const useAppLockContext = () => {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLockContext must be used within AppLockProvider');
  }
  return context;
};

import { useCallback } from 'react';
import { useAppLockContext } from '@/context/AppLockContext';
import {
  storePinHash,
  getPinHash,
  clearPinHash,
  setAppLockEnabled,
  setBiometricEnabled,
  setLockTimeout,
  getLockTimeout,
  clearLastActiveTimestamp,
} from '@/services/storage';

/**
 * Hook for managing app lock settings and operations.
 * Wraps AppLockContext with setup/config methods.
 */
export const useAppLock = () => {
  const {
    isLocked,
    isAppLockEnabled,
    isBiometricEnabled,
    isBiometricAvailable,
    hasPinSet,
    lock,
    unlockWithPin,
    unlockWithBiometric,
    refreshConfig,
  } = useAppLockContext();

  const setupPin = useCallback(
    async (pin: string) => {
      await storePinHash(pin);
      await refreshConfig();
    },
    [refreshConfig]
  );

  const removePin = useCallback(async () => {
    await Promise.all([
      clearPinHash(),
      setAppLockEnabled(false),
      setBiometricEnabled(false),
      clearLastActiveTimestamp(),
    ]);
    await refreshConfig();
  }, [refreshConfig]);

  const enableAppLock = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        // Read directly from storage to avoid stale closure issues.
        // When setupPin() is called followed by enableAppLock(true),
        // the hasPinSet state from the closure may still be false
        // even though the PIN was just stored.
        const pinHash = await getPinHash();
        if (!pinHash) {
          throw new Error('Cannot enable app lock without a PIN set');
        }
      }
      await setAppLockEnabled(enabled);
      await refreshConfig();
    },
    [refreshConfig]
  );

  const enableBiometric = useCallback(
    async (enabled: boolean) => {
      await setBiometricEnabled(enabled);
      await refreshConfig();
    },
    [refreshConfig]
  );

  const updateTimeout = useCallback(async (minutes: number) => {
    await setLockTimeout(minutes);
  }, []);

  return {
    // State
    isLocked,
    isAppLockEnabled,
    isBiometricEnabled,
    isBiometricAvailable,
    hasPinSet,

    // Unlock actions
    lock,
    unlockWithPin,
    unlockWithBiometric,

    // Setup actions
    setupPin,
    removePin,
    enableAppLock,
    enableBiometric,
    updateTimeout,
    getLockTimeout,
  };
};

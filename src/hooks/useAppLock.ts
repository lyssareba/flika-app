import { useCallback } from 'react';
import { useAppLockContext } from '@/context/AppLockContext';
import {
  storePinHash,
  clearPinHash,
  setAppLockEnabled,
  setBiometricEnabled,
  setLockTimeout,
  getLockTimeout,
} from '@/services/storage';

/**
 * Hook for managing app lock settings and operations.
 * Wraps AppLockContext with setup/config methods.
 */
export function useAppLock() {
  const context = useAppLockContext();

  const setupPin = useCallback(
    async (pin: string) => {
      await storePinHash(pin);
      await context.refreshConfig();
    },
    [context]
  );

  const removePin = useCallback(async () => {
    await clearPinHash();
    await setAppLockEnabled(false);
    await setBiometricEnabled(false);
    await context.refreshConfig();
  }, [context]);

  const enableAppLock = useCallback(
    async (enabled: boolean) => {
      await setAppLockEnabled(enabled);
      await context.refreshConfig();
    },
    [context]
  );

  const enableBiometric = useCallback(
    async (enabled: boolean) => {
      await setBiometricEnabled(enabled);
      await context.refreshConfig();
    },
    [context]
  );

  const updateTimeout = useCallback(async (minutes: number) => {
    await setLockTimeout(minutes);
  }, []);

  return {
    // State from context
    isLocked: context.isLocked,
    isAppLockEnabled: context.isAppLockEnabled,
    isBiometricEnabled: context.isBiometricEnabled,
    isBiometricAvailable: context.isBiometricAvailable,
    hasPinSet: context.hasPinSet,

    // Unlock actions
    lock: context.lock,
    unlockWithPin: context.unlockWithPin,
    unlockWithBiometric: context.unlockWithBiometric,

    // Setup actions
    setupPin,
    removePin,
    enableAppLock,
    enableBiometric,
    updateTimeout,
    getLockTimeout,
  };
}

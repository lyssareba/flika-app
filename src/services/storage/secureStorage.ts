import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PIN_HASH_KEY = 'pinHash';
const APP_LOCK_ENABLED_KEY = 'appLockEnabled';
const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

/**
 * Hash a PIN using SHA-256
 * Note: For a 4-digit PIN the keyspace is small, but SecureStore
 * provides device-level encryption on top of this.
 */
export const hashPin = async (pin: string): Promise<string> => {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
};

/**
 * Store hashed PIN in device SecureStore (never sent to cloud)
 */
export const storePinHash = async (pin: string): Promise<void> => {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
};

/**
 * Get stored PIN hash
 */
export const getPinHash = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(PIN_HASH_KEY);
};

/**
 * Verify a PIN against the stored hash
 */
export const verifyPin = async (pin: string): Promise<boolean> => {
  const storedHash = await getPinHash();
  if (!storedHash) return false;

  const inputHash = await hashPin(pin);
  return storedHash === inputHash;
};

/**
 * Clear stored PIN hash
 */
export const clearPinHash = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PIN_HASH_KEY);
};

/**
 * Store app lock enabled preference in SecureStore
 */
export const setAppLockEnabled = async (enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(APP_LOCK_ENABLED_KEY, JSON.stringify(enabled));
};

/**
 * Get app lock enabled preference
 */
export const getAppLockEnabled = async (): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(APP_LOCK_ENABLED_KEY);
  return value ? JSON.parse(value) : false;
};

/**
 * Store biometric enabled preference in SecureStore
 */
export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, JSON.stringify(enabled));
};

/**
 * Get biometric enabled preference
 */
export const getBiometricEnabled = async (): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return value ? JSON.parse(value) : false;
};

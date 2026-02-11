import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Key generators - scope all lock settings to user ID
const getPinHashKey = (userId: string) => `${userId}_pinHash`;
const getAppLockEnabledKey = (userId: string) => `${userId}_appLockEnabled`;
const getBiometricEnabledKey = (userId: string) => `${userId}_biometricEnabled`;

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
export const storePinHash = async (userId: string, pin: string): Promise<void> => {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(getPinHashKey(userId), hash);
};

/**
 * Get stored PIN hash for a user
 */
export const getPinHash = async (userId: string): Promise<string | null> => {
  return SecureStore.getItemAsync(getPinHashKey(userId));
};

/**
 * Verify a PIN against the stored hash
 */
export const verifyPin = async (userId: string, pin: string): Promise<boolean> => {
  const storedHash = await getPinHash(userId);
  if (!storedHash) return false;

  const inputHash = await hashPin(pin);
  return storedHash === inputHash;
};

/**
 * Clear stored PIN hash for a user
 */
export const clearPinHash = async (userId: string): Promise<void> => {
  await SecureStore.deleteItemAsync(getPinHashKey(userId));
};

/**
 * Store app lock enabled preference in SecureStore
 */
export const setAppLockEnabled = async (userId: string, enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(getAppLockEnabledKey(userId), JSON.stringify(enabled));
};

/**
 * Get app lock enabled preference
 */
export const getAppLockEnabled = async (userId: string): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(getAppLockEnabledKey(userId));
  return value ? JSON.parse(value) : false;
};

/**
 * Store biometric enabled preference in SecureStore
 */
export const setBiometricEnabled = async (userId: string, enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(getBiometricEnabledKey(userId), JSON.stringify(enabled));
};

/**
 * Get biometric enabled preference
 */
export const getBiometricEnabled = async (userId: string): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(getBiometricEnabledKey(userId));
  return value ? JSON.parse(value) : false;
};

export const clearAllSecureStorage = async (userId: string): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(getPinHashKey(userId)),
    SecureStore.deleteItemAsync(getAppLockEnabledKey(userId)),
    SecureStore.deleteItemAsync(getBiometricEnabledKey(userId)),
  ]);
};

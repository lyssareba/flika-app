import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCK_TIMEOUT_KEY = 'appLockTimeout';
const LAST_ACTIVE_KEY = 'lastActiveTimestamp';

/**
 * Store the app lock timeout preference (in minutes)
 */
export const setLockTimeout = async (minutes: number): Promise<void> => {
  await AsyncStorage.setItem(LOCK_TIMEOUT_KEY, JSON.stringify(minutes));
};

/**
 * Get the app lock timeout preference (defaults to 10 minutes)
 */
export const getLockTimeout = async (): Promise<number> => {
  const value = await AsyncStorage.getItem(LOCK_TIMEOUT_KEY);
  return value ? JSON.parse(value) : 10;
};

/**
 * Store the last active timestamp (when app went to background)
 */
export const setLastActiveTimestamp = async (): Promise<void> => {
  await AsyncStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify(Date.now()));
};

/**
 * Get the last active timestamp
 */
export const getLastActiveTimestamp = async (): Promise<number | null> => {
  const value = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
  return value ? JSON.parse(value) : null;
};

/**
 * Clear the last active timestamp
 */
export const clearLastActiveTimestamp = async (): Promise<void> => {
  await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
};

/**
 * Check if the lock timeout has elapsed since last active
 */
export const hasLockTimeoutElapsed = async (): Promise<boolean> => {
  const [lastActive, timeout] = await Promise.all([
    getLastActiveTimestamp(),
    getLockTimeout(),
  ]);
  if (!lastActive) return true;

  const timeoutMs = timeout * 60 * 1000;
  const elapsed = Date.now() - lastActive;

  return elapsed >= timeoutMs;
};

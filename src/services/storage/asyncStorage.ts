import AsyncStorage from '@react-native-async-storage/async-storage';

// Key generators - scope all lock settings to user ID
const getLockTimeoutKey = (userId: string) => `${userId}_appLockTimeout`;
const getLastActiveKey = (userId: string) => `${userId}_lastActiveTimestamp`;

/**
 * Store the app lock timeout preference (in minutes)
 */
export const setLockTimeout = async (userId: string, minutes: number): Promise<void> => {
  await AsyncStorage.setItem(getLockTimeoutKey(userId), JSON.stringify(minutes));
};

/**
 * Get the app lock timeout preference (defaults to 10 minutes)
 */
export const getLockTimeout = async (userId: string): Promise<number> => {
  const value = await AsyncStorage.getItem(getLockTimeoutKey(userId));
  return value ? JSON.parse(value) : 10;
};

/**
 * Store the last active timestamp (when app went to background)
 */
export const setLastActiveTimestamp = async (userId: string): Promise<void> => {
  await AsyncStorage.setItem(getLastActiveKey(userId), JSON.stringify(Date.now()));
};

/**
 * Get the last active timestamp
 */
export const getLastActiveTimestamp = async (userId: string): Promise<number | null> => {
  const value = await AsyncStorage.getItem(getLastActiveKey(userId));
  return value ? JSON.parse(value) : null;
};

/**
 * Clear the last active timestamp
 */
export const clearLastActiveTimestamp = async (userId: string): Promise<void> => {
  await AsyncStorage.removeItem(getLastActiveKey(userId));
};

/**
 * Check if the lock timeout has elapsed since last active
 */
export const hasLockTimeoutElapsed = async (userId: string): Promise<boolean> => {
  const [lastActive, timeout] = await Promise.all([
    getLastActiveTimestamp(userId),
    getLockTimeout(userId),
  ]);
  if (!lastActive) return true;

  const timeoutMs = timeout * 60 * 1000;
  const elapsed = Date.now() - lastActive;

  return elapsed >= timeoutMs;
};

import * as SecureStore from 'expo-secure-store';
import {
  storePinHash,
  getPinHash,
  verifyPin,
  clearPinHash,
  setAppLockEnabled,
  getAppLockEnabled,
  setBiometricEnabled,
  getBiometricEnabled,
} from '@/services/storage/secureStorage';

const TEST_USER_ID = 'test-user-123';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PIN storage', () => {
  it('stores a hashed PIN scoped to user', async () => {
    await storePinHash(TEST_USER_ID, '1234');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${TEST_USER_ID}_pinHash`,
      expect.any(String)
    );
    // Hash should not be the raw PIN
    const storedHash = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
    expect(storedHash).not.toBe('1234');
  });

  it('retrieves a stored PIN hash for user', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('somehash');
    const hash = await getPinHash(TEST_USER_ID);
    expect(hash).toBe('somehash');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(`${TEST_USER_ID}_pinHash`);
  });

  it('returns null when no PIN is stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const hash = await getPinHash(TEST_USER_ID);
    expect(hash).toBeNull();
  });

  it('verifies correct PIN returns true', async () => {
    // Store a PIN, then verify it
    await storePinHash(TEST_USER_ID, '5678');
    const storedHash = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(storedHash);

    const result = await verifyPin(TEST_USER_ID, '5678');
    expect(result).toBe(true);
  });

  it('verifies wrong PIN returns false', async () => {
    await storePinHash(TEST_USER_ID, '5678');
    const storedHash = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(storedHash);

    const result = await verifyPin(TEST_USER_ID, '0000');
    expect(result).toBe(false);
  });

  it('returns false when no PIN is stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await verifyPin(TEST_USER_ID, '1234');
    expect(result).toBe(false);
  });

  it('clears stored PIN hash for user', async () => {
    await clearPinHash(TEST_USER_ID);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(`${TEST_USER_ID}_pinHash`);
  });

  it('isolates PINs between users', async () => {
    const user1 = 'user-1';
    const user2 = 'user-2';

    // Store PIN for user1
    await storePinHash(user1, '1111');
    const user1Hash = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];

    // Store PIN for user2
    await storePinHash(user2, '2222');
    const user2Hash = (SecureStore.setItemAsync as jest.Mock).mock.calls[1][1];

    // Verify keys are different
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(`${user1}_pinHash`, user1Hash);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(`${user2}_pinHash`, user2Hash);
    expect(user1Hash).not.toBe(user2Hash);
  });
});

describe('app lock preference', () => {
  it('stores app lock enabled state scoped to user', async () => {
    await setAppLockEnabled(TEST_USER_ID, true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${TEST_USER_ID}_appLockEnabled`,
      'true'
    );
  });

  it('retrieves app lock enabled state for user', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('true');
    const result = await getAppLockEnabled(TEST_USER_ID);
    expect(result).toBe(true);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(`${TEST_USER_ID}_appLockEnabled`);
  });

  it('defaults to false when not set', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await getAppLockEnabled(TEST_USER_ID);
    expect(result).toBe(false);
  });
});

describe('biometric preference', () => {
  it('stores biometric enabled state scoped to user', async () => {
    await setBiometricEnabled(TEST_USER_ID, true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${TEST_USER_ID}_biometricEnabled`,
      'true'
    );
  });

  it('retrieves biometric enabled state for user', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('false');
    const result = await getBiometricEnabled(TEST_USER_ID);
    expect(result).toBe(false);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(`${TEST_USER_ID}_biometricEnabled`);
  });

  it('defaults to false when not set', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await getBiometricEnabled(TEST_USER_ID);
    expect(result).toBe(false);
  });
});

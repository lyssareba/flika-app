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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PIN storage', () => {
  it('stores a hashed PIN', async () => {
    await storePinHash('1234');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'pinHash',
      expect.any(String)
    );
    // Hash should not be the raw PIN
    const storedHash = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
    expect(storedHash).not.toBe('1234');
  });

  it('retrieves a stored PIN hash', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('somehash');
    const hash = await getPinHash();
    expect(hash).toBe('somehash');
  });

  it('returns null when no PIN is stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const hash = await getPinHash();
    expect(hash).toBeNull();
  });

  it('verifies correct PIN returns true', async () => {
    // Store a PIN, then verify it
    await storePinHash('5678');
    const storedHash = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(storedHash);

    const result = await verifyPin('5678');
    expect(result).toBe(true);
  });

  it('verifies wrong PIN returns false', async () => {
    await storePinHash('5678');
    const storedHash = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(storedHash);

    const result = await verifyPin('0000');
    expect(result).toBe(false);
  });

  it('returns false when no PIN is stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await verifyPin('1234');
    expect(result).toBe(false);
  });

  it('clears stored PIN hash', async () => {
    await clearPinHash();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('pinHash');
  });
});

describe('app lock preference', () => {
  it('stores app lock enabled state', async () => {
    await setAppLockEnabled(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'appLockEnabled',
      'true'
    );
  });

  it('retrieves app lock enabled state', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('true');
    const result = await getAppLockEnabled();
    expect(result).toBe(true);
  });

  it('defaults to false when not set', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await getAppLockEnabled();
    expect(result).toBe(false);
  });
});

describe('biometric preference', () => {
  it('stores biometric enabled state', async () => {
    await setBiometricEnabled(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'biometricEnabled',
      'true'
    );
  });

  it('retrieves biometric enabled state', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('false');
    const result = await getBiometricEnabled();
    expect(result).toBe(false);
  });

  it('defaults to false when not set', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await getBiometricEnabled();
    expect(result).toBe(false);
  });
});

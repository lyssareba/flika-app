import { Platform } from 'react-native';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import { env } from '@/config';
import { RC_ENTITLEMENTS } from '@/constants/purchases';

let initialized = false;

/**
 * Configure the RevenueCat SDK with the platform-specific API key.
 * No-ops if already initialized or if no API key is available (e.g. web).
 */
export async function initialize(): Promise<void> {
  if (initialized) return;

  const apiKey = Platform.select<string | undefined>({
    android: env.revenuecatAndroidApiKey || undefined,
    ios: env.revenuecatIosApiKey || undefined,
  });

  if (!apiKey) {
    console.warn(
      'RevenueCat: No API key found for this platform. Purchases will not be available.'
    );
    return;
  }

  Purchases.configure({ apiKey });

  if (__DEV__) {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  }

  initialized = true;
}

/**
 * Associate a Firebase UID with RevenueCat for cross-platform identity.
 */
export async function loginUser(userId: string): Promise<void> {
  if (!initialized) return;
  await Purchases.logIn(userId);
}

/**
 * Clear the current RevenueCat user association.
 */
export async function logoutUser(): Promise<void> {
  if (!initialized) return;
  await Purchases.logOut();
}

/**
 * Fetch the current customer info from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!initialized) return null;
  return Purchases.getCustomerInfo();
}

/**
 * Check whether the user has an active premium entitlement.
 * Accepts both "premium" and "early_adopter" entitlements.
 */
export function checkPremiumFromInfo(customerInfo: CustomerInfo): boolean {
  const entitlements = customerInfo.entitlements.active;
  return (
    RC_ENTITLEMENTS.PREMIUM in entitlements ||
    RC_ENTITLEMENTS.EARLY_ADOPTER in entitlements
  );
}

/**
 * Whether the RevenueCat SDK has been initialized.
 */
export function isInitialized(): boolean {
  return initialized;
}

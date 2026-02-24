import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesOffering,
} from 'react-native-purchases';
import { env } from '@/config';
import { RC_ENTITLEMENTS } from '@/constants/purchases';

class PurchasesService {
  private initialized = false;

  /**
   * Configure the RevenueCat SDK with the platform-specific API key.
   * No-ops if already initialized or if no API key is available (e.g. web).
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

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

    this.initialized = true;
  }

  /**
   * Associate a Firebase UID with RevenueCat for cross-platform identity.
   */
  async loginUser(userId: string): Promise<void> {
    if (!this.initialized) return;
    await Purchases.logIn(userId);
  }

  /**
   * Clear the current RevenueCat user association.
   */
  async logoutUser(): Promise<void> {
    if (!this.initialized) return;
    await Purchases.logOut();
  }

  /**
   * Fetch the current customer info from RevenueCat.
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.initialized) return null;
    return Purchases.getCustomerInfo();
  }

  /**
   * Get available subscription packages from the current offering.
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.initialized) return null;
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  }

  /**
   * Purchase a package and return updated customer info.
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
    if (!this.initialized) return null;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  }

  /**
   * Restore previous purchases and return updated customer info.
   */
  async restorePurchases(): Promise<CustomerInfo | null> {
    if (!this.initialized) return null;
    return Purchases.restorePurchases();
  }

  /**
   * Async check for whether the user has an active premium entitlement.
   */
  async isPremium(): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    if (!customerInfo) return false;
    return this.checkPremiumFromInfo(customerInfo);
  }

  /**
   * Sync check for premium status from a CustomerInfo object.
   * Accepts both "premium" and "early_adopter" entitlements.
   */
  checkPremiumFromInfo(customerInfo: CustomerInfo): boolean {
    const entitlements = customerInfo.entitlements.active;
    return (
      RC_ENTITLEMENTS.PREMIUM in entitlements ||
      RC_ENTITLEMENTS.EARLY_ADOPTER in entitlements
    );
  }

  /**
   * Get the store's subscription management URL (for cancellation, plan changes, etc.).
   */
  async getManagementURL(): Promise<string | null> {
    const customerInfo = await this.getCustomerInfo();
    return customerInfo?.managementURL ?? null;
  }

  /**
   * Set early adopter attributes on RevenueCat for segmentation.
   */
  async setEarlyAdopterAttribute(slotNumber: number): Promise<void> {
    if (!this.initialized) return;
    await Purchases.setAttributes({
      early_adopter: 'true',
      early_adopter_slot: String(slotNumber),
    });
  }

  /**
   * Whether the RevenueCat SDK has been initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

export const purchasesService = new PurchasesService();

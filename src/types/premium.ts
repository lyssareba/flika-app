export type EntitlementId = 'premium' | 'early_adopter';

export interface PremiumEntitlement {
  id: EntitlementId;
  isActive: boolean;
  expirationDate: Date | null;
  productIdentifier: string | null;
  isSandbox: boolean;
  willRenew: boolean;
}

export type SubscriptionPeriod = 'monthly' | 'annual' | 'lifetime';

export interface SubscriptionPackage {
  identifier: string;
  period: SubscriptionPeriod;
  price: string;
  pricePerMonth: string;
  savings?: string;
  product: {
    title: string;
    description: string;
  };
}

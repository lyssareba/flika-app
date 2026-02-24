/**
 * RevenueCat product and entitlement identifiers.
 * These must match the IDs configured in the RevenueCat dashboard.
 */

export const RC_ENTITLEMENTS = {
  PREMIUM: 'premium',
  EARLY_ADOPTER: 'early_adopter',
} as const;

export const RC_OFFERINGS = {
  DEFAULT: 'default',
} as const;

export const RC_PRODUCTS = {
  MONTHLY: 'flika_premium_monthly',
  ANNUAL: 'flika_premium_annual',
  LIFETIME: 'flika_premium_lifetime',
} as const;

export const PREMIUM_FEATURES = [
  'paywall.feature.unlimitedProspects',
  'paywall.feature.compatibilityBreakdown',
  'paywall.feature.unlimitedDates',
  'paywall.feature.dataExport',
  'paywall.feature.cloudSync',
  'paywall.feature.prioritySupport',
] as const;

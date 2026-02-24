import { logAnalyticsEvent } from './analyticsService';

export function paywallViewed(source: string): void {
  logAnalyticsEvent('paywall_viewed', { source });
}

export function planSelected(planId: string): void {
  logAnalyticsEvent('plan_selected', { plan_id: planId });
}

export function purchaseInitiated(planId: string): void {
  logAnalyticsEvent('purchase_initiated', { plan_id: planId });
}

export function purchaseCompleted(planId: string, price: number, currencyCode: string): void {
  logAnalyticsEvent('purchase_completed', { plan_id: planId, price, currency_code: currencyCode });
}

export function purchaseFailed(planId: string, errorCode?: string): void {
  logAnalyticsEvent('purchase_failed', { plan_id: planId, error_code: errorCode });
}

export function purchaseCancelled(planId: string): void {
  logAnalyticsEvent('purchase_cancelled', { plan_id: planId });
}

export function featureGated(feature: string, action: 'blocked' | 'upgraded' | 'dismissed'): void {
  logAnalyticsEvent('feature_gated', { feature, action });
}

export function earlyAdopterClaimed(slotNumber: number): void {
  logAnalyticsEvent('early_adopter_claimed', { slot_number: slotNumber });
}

export function restorePurchasesAttempted(): void {
  logAnalyticsEvent('restore_purchases_attempted');
}

export function restorePurchasesCompleted(found: boolean): void {
  logAnalyticsEvent('restore_purchases_completed', { found });
}

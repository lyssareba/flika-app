import { getAnalytics, logEvent, isSupported, type Analytics } from 'firebase/analytics';
import { app } from '@/services/firebase/config';

let analytics: Analytics | null = null;

export async function initializeAnalytics(): Promise<void> {
  if (await isSupported()) {
    analytics = getAnalytics(app);
  }
}

export function logAnalyticsEvent(name: string, params?: Record<string, unknown>): void {
  if (analytics) {
    logEvent(analytics, name, params);
  } else if (__DEV__) {
    console.debug(`[Analytics] ${name}`, params ?? '');
  }
}

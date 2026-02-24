import { useCallback } from 'react';
import { useRouter, type RelativePathString } from 'expo-router';
import { usePremium } from '@/context/PremiumContext';
import { featureGated } from '@/services/analytics';

// Route will be created in issue #102
const PAYWALL_ROUTE = '/paywall' as RelativePathString;

export const usePremiumFeature = () => {
  const { isPremium } = usePremium();
  const router = useRouter();

  const requirePremium = useCallback(
    (
      callback: () => void,
      options?: { feature?: string; onBlocked?: () => void }
    ) => {
      if (isPremium) {
        callback();
      } else {
        featureGated(options?.feature ?? 'unknown', 'blocked');
        options?.onBlocked?.();
        router.push({
          pathname: PAYWALL_ROUTE,
          params: options?.feature ? { feature: options.feature } : undefined,
        });
      }
    },
    [isPremium, router]
  );

  return { requirePremium, isPremium };
};

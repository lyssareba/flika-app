import React from 'react';
import { usePremium } from '@/context/PremiumContext';
import { LockedFeatureCard } from './LockedFeatureCard';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  fallback?: React.ReactNode;
}

export const PremiumGate = ({
  children,
  feature,
  description,
  fallback,
}: PremiumGateProps) => {
  const { isPremium } = usePremium();

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <LockedFeatureCard feature={feature} description={description} />;
};

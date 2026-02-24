import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesError,
} from 'react-native-purchases';
import { purchasesService } from '@/services/purchases';
import { FEATURE_FLAGS } from '@/config';
import { RC_ENTITLEMENTS } from '@/constants/purchases';
import { shouldShowError } from '@/utils/purchaseErrors';
import { isUserEarlyAdopter } from '@/services/firebase/earlyAdopterService';
import { useAuth } from '@/hooks/useAuth';

interface PremiumContextType {
  isPremium: boolean;
  isEarlyAdopter: boolean;
  isLoading: boolean;
  offerings: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  refreshStatus: () => Promise<void>;
  purchase: (packageId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [actualPremium, setActualPremium] = useState(false);
  const [rcEarlyAdopter, setRcEarlyAdopter] = useState(false);
  const [firebaseEarlyAdopter, setFirebaseEarlyAdopter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const isEarlyAdopter = useMemo(() => {
    if (!FEATURE_FLAGS.earlyAdopterEnabled) return false;
    return rcEarlyAdopter || firebaseEarlyAdopter;
  }, [rcEarlyAdopter, firebaseEarlyAdopter]);

  const isPremium = useMemo(() => {
    if (!FEATURE_FLAGS.paywallEnabled) return true;
    if (isEarlyAdopter) return true;
    return actualPremium;
  }, [actualPremium, isEarlyAdopter]);

  const updateFromCustomerInfo = useCallback((info: CustomerInfo) => {
    setCustomerInfo(info);
    setActualPremium(purchasesService.checkPremiumFromInfo(info));
    setRcEarlyAdopter(
      info.entitlements.active[RC_ENTITLEMENTS.EARLY_ADOPTER] !== undefined
    );
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const uid = user?.uid;
      const [info, currentOfferings, fbEarlyAdopter] = await Promise.all([
        purchasesService.getCustomerInfo(),
        purchasesService.getOfferings(),
        uid ? isUserEarlyAdopter(uid).catch(() => false) : Promise.resolve(false),
      ]);
      if (info) {
        updateFromCustomerInfo(info);
      }
      setOfferings(currentOfferings);
      setFirebaseEarlyAdopter(fbEarlyAdopter);
    } catch (error) {
      console.error('Failed to refresh premium status:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateFromCustomerInfo]);

  const purchase = useCallback(async (packageId: string): Promise<boolean> => {
    if (!offerings) return false;

    const pkg = offerings.availablePackages.find(
      (p) => p.identifier === packageId
    );
    if (!pkg) return false;

    try {
      const info = await purchasesService.purchasePackage(pkg);
      if (!info) return false;
      updateFromCustomerInfo(info);
      return purchasesService.checkPremiumFromInfo(info);
    } catch (error: unknown) {
      if (!shouldShowError(error as PurchasesError)) {
        return false;
      }
      throw error;
    }
  }, [offerings, updateFromCustomerInfo]);

  const restore = useCallback(async (): Promise<boolean> => {
    const info = await purchasesService.restorePurchases();
    if (!info) return false;
    updateFromCustomerInfo(info);
    return purchasesService.checkPremiumFromInfo(info);
  }, [updateFromCustomerInfo]);

  useEffect(() => {
    if (user) {
      refreshStatus();
    } else {
      setActualPremium(false);
      setRcEarlyAdopter(false);
      setFirebaseEarlyAdopter(false);
      setCustomerInfo(null);
      setOfferings(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, refreshStatus]);

  const value = useMemo(
    () => ({
      isPremium,
      isEarlyAdopter,
      isLoading,
      offerings,
      customerInfo,
      refreshStatus,
      purchase,
      restore,
    }),
    [isPremium, isEarlyAdopter, isLoading, offerings, customerInfo, refreshStatus, purchase, restore]
  );

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};

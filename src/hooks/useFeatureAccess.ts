import { useCallback, useMemo } from 'react';
import { usePremium } from '@/context/PremiumContext';
import { useProspects } from '@/hooks/useProspects';
import { getLimits } from '@/config/premiumLimits';

export const useFeatureAccess = () => {
  const { isPremium } = usePremium();
  const { activeProspects, archivedProspects } = useProspects();
  const limits = getLimits(isPremium);

  const getDateLimit = useCallback(
    (prospectDatesCount: number) => ({
      canAddDate: prospectDatesCount < limits.maxDatesPerProspect,
      dateCount: prospectDatesCount,
      dateLimit: limits.maxDatesPerProspect,
    }),
    [limits.maxDatesPerProspect]
  );

  return useMemo(
    () => ({
      // Prospect limits
      canAddProspect: activeProspects.length < limits.maxActiveProspects,
      activeProspectCount: activeProspects.length,
      activeProspectLimit: limits.maxActiveProspects,

      // Archive limits
      canArchiveMore: archivedProspects.length < limits.maxArchivedProspects,
      archivedProspectCount: archivedProspects.length,
      archivedProspectLimit: limits.maxArchivedProspects,

      // Date limits (caller passes in the count since they already have the prospect loaded)
      getDateLimit,

      // Feature booleans
      hasCompatibilityBreakdown: limits.hasCompatibilityBreakdown,
      hasDataExport: limits.hasDataExport,
      hasCloudSync: limits.hasCloudSync,
      hasDatingRecaps: limits.hasDatingRecaps,
    }),
    [activeProspects.length, archivedProspects.length, limits, getDateLimit]
  );
};

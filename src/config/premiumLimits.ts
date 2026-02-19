export const LIMITS = {
  free: {
    maxActiveProspects: 3,
    maxArchivedProspects: 5,
    maxDatesPerProspect: 3,
    hasCompatibilityBreakdown: false,
    hasDataExport: false,
    hasCloudSync: false,
    hasDatingRecaps: false,
  },
  premium: {
    maxActiveProspects: Infinity,
    maxArchivedProspects: Infinity,
    maxDatesPerProspect: Infinity,
    hasCompatibilityBreakdown: true,
    hasDataExport: true,
    hasCloudSync: true,
    hasDatingRecaps: true,
  },
} as const;

export type PremiumLimits = typeof LIMITS.free | typeof LIMITS.premium;

export const getLimits = (isPremium: boolean): PremiumLimits =>
  isPremium ? LIMITS.premium : LIMITS.free;

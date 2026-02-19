import { LIMITS, getLimits } from '../premiumLimits';

describe('premiumLimits', () => {
  describe('getLimits', () => {
    it('returns free limits when isPremium is false', () => {
      const limits = getLimits(false);
      expect(limits.maxActiveProspects).toBe(3);
      expect(limits.maxArchivedProspects).toBe(5);
      expect(limits.maxDatesPerProspect).toBe(3);
    });

    it('returns premium limits with Infinity when isPremium is true', () => {
      const limits = getLimits(true);
      expect(limits.maxActiveProspects).toBe(Infinity);
      expect(limits.maxArchivedProspects).toBe(Infinity);
      expect(limits.maxDatesPerProspect).toBe(Infinity);
    });

    it('has all feature booleans false for free tier', () => {
      const limits = getLimits(false);
      expect(limits.hasCompatibilityBreakdown).toBe(false);
      expect(limits.hasDataExport).toBe(false);
      expect(limits.hasCloudSync).toBe(false);
      expect(limits.hasDatingRecaps).toBe(false);
    });

    it('has all feature booleans true for premium tier', () => {
      const limits = getLimits(true);
      expect(limits.hasCompatibilityBreakdown).toBe(true);
      expect(limits.hasDataExport).toBe(true);
      expect(limits.hasCloudSync).toBe(true);
      expect(limits.hasDatingRecaps).toBe(true);
    });
  });

  describe('LIMITS', () => {
    it('defines free and premium tiers', () => {
      expect(LIMITS.free).toBeDefined();
      expect(LIMITS.premium).toBeDefined();
    });
  });
});

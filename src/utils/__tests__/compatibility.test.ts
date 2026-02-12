import {
  calculateCompatibility,
  calculateCategoryScore,
  getScoreBreakdown,
  STRICTNESS_SETTINGS,
} from '../compatibility';
import type { Trait } from '@/types';

// Helper to create a trait
const createTrait = (
  overrides: Partial<Trait> & { attributeCategory: 'dealbreaker' | 'desired' }
): Trait => ({
  id: `trait-${Math.random()}`,
  attributeId: `attr-${Math.random()}`,
  attributeName: 'Test Trait',
  state: 'unknown',
  updatedAt: new Date(),
  ...overrides,
});

describe('calculateCategoryScore', () => {
  it('returns 100 for empty traits array', () => {
    expect(calculateCategoryScore([], 2.0)).toBe(100);
  });

  it('returns 0 for all unknown traits', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'unknown' }),
      createTrait({ attributeCategory: 'desired', state: 'unknown' }),
    ];
    // No confirmed traits = start at 0
    expect(calculateCategoryScore(traits, 2.0)).toBe(0);
  });

  it('returns 100 for all yes traits', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
    ];
    expect(calculateCategoryScore(traits, 2.0)).toBe(100);
  });

  it('returns 0 for all no traits (clamped)', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'no' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    // With 2 traits, impact per trait = 25
    // Each "no" with 2.0 loss aversion = -50
    // 50 - 50 - 50 = -50, clamped to 0
    expect(calculateCategoryScore(traits, 2.0)).toBe(0);
  });

  it('applies loss aversion correctly for gentle setting', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'no' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    // impact per trait = 25, "no" with 1.5 loss aversion = -37.5 each
    // 50 - 37.5 - 37.5 = -25, clamped to 0
    expect(calculateCategoryScore(traits, 1.5)).toBe(0);
  });

  it('applies loss aversion correctly for strict setting', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    // 1 trait, impact = 50, "no" with 2.5 = -125
    // 50 - 125 = -75, clamped to 0
    expect(calculateCategoryScore(traits, 2.5)).toBe(0);
  });

  it('handles mixed yes/no correctly', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    // 2 traits, impact per trait = 50
    // yes: +50, no with 2.0 loss aversion: -100
    // 0 + 50 - 100 = -50, clamped to 0
    expect(calculateCategoryScore(traits, 2.0)).toBe(0);
  });

  it('ignores unknown traits in calculation', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'unknown' }),
    ];
    // 2 traits, impact per trait = 50
    // Only "yes" counts: +50
    // 0 + 50 = 50
    expect(calculateCategoryScore(traits, 2.0)).toBe(50);
  });
});

describe('calculateCompatibility', () => {
  it('returns 0 for all unknown traits', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'unknown' }),
      createTrait({ attributeCategory: 'desired', state: 'unknown' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    // No confirmed traits = start at 0
    expect(result.overall).toBe(0);
    expect(result.dealbreakersScore).toBe(0);
    expect(result.desiredScore).toBe(0);
    expect(result.unknownCount).toBe(2);
    expect(result.confirmedYesCount).toBe(0);
    expect(result.confirmedNoCount).toBe(0);
  });

  it('returns 100 for all yes traits', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    expect(result.overall).toBe(100);
    expect(result.dealbreakersScore).toBe(100);
    expect(result.desiredScore).toBe(100);
  });

  it('returns 0 for all no traits', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'no' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    expect(result.overall).toBe(0);
    expect(result.dealbreakersScore).toBe(0);
    expect(result.desiredScore).toBe(0);
  });

  it('weights dealbreakers at 60% and desired at 40%', () => {
    // Dealbreakers: all yes = 100
    // Desired: all no = 0
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    // 100 * 0.6 + 0 * 0.4 = 60
    expect(result.overall).toBe(60);
  });

  it('handles no dealbreakers (all desired)', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    // No dealbreakers = 100, desired = 100
    // 100 * 0.6 + 100 * 0.4 = 100
    expect(result.overall).toBe(100);
    expect(result.dealbreakersScore).toBe(100);
  });

  it('handles no desired traits (all dealbreakers)', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    // Dealbreakers = 100, no desired = 100
    // 100 * 0.6 + 100 * 0.4 = 100
    expect(result.overall).toBe(100);
    expect(result.desiredScore).toBe(100);
  });

  it('handles empty traits array', () => {
    const result = calculateCompatibility([], 'normal');
    expect(result.overall).toBe(100);
    expect(result.unknownCount).toBe(0);
    expect(result.confirmedYesCount).toBe(0);
    expect(result.confirmedNoCount).toBe(0);
    expect(result.dealbreakersWithNo).toEqual([]);
  });

  it('populates dealbreakersWithNo correctly', () => {
    const traits = [
      createTrait({
        attributeCategory: 'dealbreaker',
        state: 'no',
        attributeName: 'Honesty',
      }),
      createTrait({
        attributeCategory: 'dealbreaker',
        state: 'yes',
        attributeName: 'Kindness',
      }),
      createTrait({
        attributeCategory: 'dealbreaker',
        state: 'no',
        attributeName: 'Ambition',
      }),
      createTrait({
        attributeCategory: 'desired',
        state: 'no',
        attributeName: 'Humor', // Should NOT be in dealbreakersWithNo
      }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    expect(result.dealbreakersWithNo).toEqual(['Honesty', 'Ambition']);
  });

  it('counts confirmed traits correctly', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'dealbreaker', state: 'no' }),
      createTrait({ attributeCategory: 'desired', state: 'unknown' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    expect(result.unknownCount).toBe(1);
    expect(result.confirmedYesCount).toBe(2);
    expect(result.confirmedNoCount).toBe(1);
  });

  describe('strictness levels', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'no' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
    ];

    it('gentle (1.5x) produces higher scores', () => {
      const result = calculateCompatibility(traits, 'gentle');
      // Dealbreakers: 1 trait, "no" with 1.5 LA = 0 - 100*1.5 = -150 → 0
      // Desired: 1 trait, "yes" = 0 + 100 = 100
      // Overall: 0 * 0.6 + 100 * 0.4 = 40
      expect(result.overall).toBe(40);
    });

    it('normal (2.0x) produces medium scores', () => {
      const result = calculateCompatibility(traits, 'normal');
      // Dealbreakers: 1 trait, "no" with 2.0 LA = 0 - 100*2 = -200 → 0
      // Desired: 1 trait, "yes" = 0 + 100 = 100
      // Overall: 0 * 0.6 + 100 * 0.4 = 40
      expect(result.overall).toBe(40);
    });

    it('strict (2.5x) produces lower scores', () => {
      const result = calculateCompatibility(traits, 'strict');
      // Dealbreakers: 1 trait, "no" with 2.5 LA = 0 - 100*2.5 = -250 → 0
      // Desired: 1 trait, "yes" = 0 + 100 = 100
      // Overall: 0 * 0.6 + 100 * 0.4 = 40
      expect(result.overall).toBe(40);
    });

    it('strictness affects mixed scenarios', () => {
      // Use more yes than no so scores don't all clamp to 0
      const mixedTraits = [
        createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
        createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
        createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
        createTrait({ attributeCategory: 'dealbreaker', state: 'no' }),
      ];

      const gentle = calculateCompatibility(mixedTraits, 'gentle');
      const normal = calculateCompatibility(mixedTraits, 'normal');
      const strict = calculateCompatibility(mixedTraits, 'strict');

      // 4 traits, impact = 25 each. 3 yes = +75, 1 no = -25 * LA
      // gentle (1.5): 75 - 37.5 = 37.5 → 38
      // normal (2.0): 75 - 50 = 25
      // strict (2.5): 75 - 62.5 = 12.5 → 13
      // Gentler settings should produce higher scores
      expect(gentle.dealbreakersScore).toBeGreaterThan(normal.dealbreakersScore);
      expect(normal.dealbreakersScore).toBeGreaterThan(strict.dealbreakersScore);
    });
  });
});

describe('getScoreBreakdown', () => {
  it('returns breakdown for both categories', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'dealbreaker', state: 'no' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
    ];

    const breakdown = getScoreBreakdown(traits, 'normal');

    expect(breakdown).toHaveLength(2);

    const dealbreaker = breakdown.find((b) => b.category === 'dealbreaker');
    expect(dealbreaker).toBeDefined();
    expect(dealbreaker?.total).toBe(2);
    expect(dealbreaker?.confirmed).toBe(2);
    expect(dealbreaker?.yesCount).toBe(1);
    expect(dealbreaker?.noCount).toBe(1);

    const desired = breakdown.find((b) => b.category === 'desired');
    expect(desired).toBeDefined();
    expect(desired?.total).toBe(1);
    expect(desired?.confirmed).toBe(1);
    expect(desired?.yesCount).toBe(1);
    expect(desired?.noCount).toBe(0);
    expect(desired?.score).toBe(100);
  });

  it('handles empty categories', () => {
    const breakdown = getScoreBreakdown([], 'normal');

    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].total).toBe(0);
    expect(breakdown[0].score).toBe(100);
    expect(breakdown[1].total).toBe(0);
    expect(breakdown[1].score).toBe(100);
  });
});

describe('STRICTNESS_SETTINGS', () => {
  it('exports all 4 strictness levels with correct coefficients', () => {
    expect(STRICTNESS_SETTINGS.noEffect).toBe(1.0);
    expect(STRICTNESS_SETTINGS.gentle).toBe(1.5);
    expect(STRICTNESS_SETTINGS.normal).toBe(2.0);
    expect(STRICTNESS_SETTINGS.strict).toBe(2.5);
    expect(Object.keys(STRICTNESS_SETTINGS)).toHaveLength(4);
  });
});

describe('noEffect strictness level', () => {
  it('treats no the same as yes (1.0 multiplier) in calculateCategoryScore', () => {
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    // 2 traits, impact = 50 each
    // yes: +50, no with 1.0 LA: -50
    // 0 + 50 - 50 = 0
    expect(calculateCategoryScore(traits, 1.0)).toBe(0);
  });

  it('produces higher scores than gentle for mixed traits', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'dealbreaker', state: 'no' }),
    ];

    const noEffect = calculateCompatibility(traits, 'noEffect');
    const gentle = calculateCompatibility(traits, 'gentle');
    // 4 traits, impact = 25. 3 yes = +75, 1 no = -25 * LA
    // noEffect (1.0): 75 - 25 = 50
    // gentle (1.5): 75 - 37.5 = 37.5 → 38
    expect(noEffect.dealbreakersScore).toBe(50);
    expect(noEffect.dealbreakersScore).toBeGreaterThan(gentle.dealbreakersScore);
  });

  it('calculateCompatibility with noEffect strictness', () => {
    const traits = [
      createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }),
      createTrait({ attributeCategory: 'dealbreaker', state: 'no' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    const result = calculateCompatibility(traits, 'noEffect');
    // Dealbreakers: 2 traits, impact=50. yes:+50, no:-50 = 0
    // Desired: 2 traits, impact=50. yes:+50, no:-50 = 0
    // Overall: 0 * 0.6 + 0 * 0.4 = 0
    expect(result.overall).toBe(0);
    expect(result.dealbreakersScore).toBe(0);
    expect(result.desiredScore).toBe(0);
  });
});

describe('large trait count', () => {
  it('handles 20+ traits with correct rounding', () => {
    const traits: Trait[] = [];
    // 20 dealbreaker traits: 15 yes, 5 no
    for (let i = 0; i < 15; i++) {
      traits.push(createTrait({ attributeCategory: 'dealbreaker', state: 'yes' }));
    }
    for (let i = 0; i < 5; i++) {
      traits.push(createTrait({ attributeCategory: 'dealbreaker', state: 'no' }));
    }

    const result = calculateCompatibility(traits, 'normal');
    // 20 traits, impact = 5 each
    // 15 yes = +75, 5 no with 2.0 LA = -50
    // 75 - 50 = 25
    expect(result.dealbreakersScore).toBe(25);
    // No desired traits → desiredScore = 100
    // Overall: 25 * 0.6 + 100 * 0.4 = 15 + 40 = 55
    expect(result.overall).toBe(55);
    expect(result.confirmedYesCount).toBe(15);
    expect(result.confirmedNoCount).toBe(5);
    expect(result.unknownCount).toBe(0);
  });

  it('rounds scores to integers', () => {
    // 3 traits: 2 yes, 1 no → impact=33.33
    // 2*33.33 - 1*33.33*2 = 66.67 - 66.67 = 0
    const traits = [
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'yes' }),
      createTrait({ attributeCategory: 'desired', state: 'no' }),
    ];
    const result = calculateCompatibility(traits, 'normal');
    // Score is a rounded integer
    expect(Number.isInteger(result.overall)).toBe(true);
    expect(Number.isInteger(result.desiredScore)).toBe(true);
  });
});

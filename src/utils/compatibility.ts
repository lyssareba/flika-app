import type { Trait , CompatibilityScore, ScoreBreakdown } from '@/types';

interface ScoringConfig {
  dealbreakersWeight: number; // 0.6 (60%)
  desiredWeight: number; // 0.4 (40%)
  lossAversionCoefficient: number; // Varies by strictness setting
}

export type StrictnessLevel = 'gentle' | 'normal' | 'strict';

const STRICTNESS_SETTINGS: Record<StrictnessLevel, number> = {
  gentle: 1.0, // "No" has 1x impact (same as "Yes")
  normal: 1.5, // "No" has 1.5x impact (default)
  strict: 2.0, // "No" has 2x impact
};

const DEALBREAKERS_WEIGHT = 0.6;
const DESIRED_WEIGHT = 0.4;

/**
 * Calculate the compatibility score for a prospect based on their traits.
 *
 * The algorithm uses loss aversion from behavioral psychology:
 * - Score starts at 0% and builds up as "Yes" responses are recorded
 * - "No" responses subtract points with loss aversion multiplier (1.5x-2.5x)
 * - Dealbreakers are weighted 60%, desired traits 40%
 * - Unknown traits don't affect the score
 * - Score is clamped to 0-100 (never goes negative)
 *
 * @param traits - Array of traits for the prospect
 * @param strictness - Scoring strictness level (affects loss aversion)
 * @returns CompatibilityScore with overall and category breakdowns
 */
export function calculateCompatibility(
  traits: Trait[],
  strictness: StrictnessLevel = 'normal'
): CompatibilityScore {
  const lossAversion = STRICTNESS_SETTINGS[strictness];

  const dealbreakers = traits.filter((t) => t.attributeCategory === 'dealbreaker');
  const desired = traits.filter((t) => t.attributeCategory === 'desired');

  const dealbreakersScore = calculateCategoryScore(dealbreakers, lossAversion);
  const desiredScore = calculateCategoryScore(desired, lossAversion);

  // Weighted combination
  const overall = Math.round(
    dealbreakersScore * DEALBREAKERS_WEIGHT + desiredScore * DESIRED_WEIGHT
  );

  // Gather stats
  const confirmedTraits = traits.filter((t) => t.state !== 'unknown');
  const dealbreakersWithNo = dealbreakers
    .filter((t) => t.state === 'no')
    .map((t) => t.attributeName);

  return {
    overall,
    dealbreakersScore: Math.round(dealbreakersScore),
    desiredScore: Math.round(desiredScore),
    unknownCount: traits.length - confirmedTraits.length,
    confirmedYesCount: confirmedTraits.filter((t) => t.state === 'yes').length,
    confirmedNoCount: confirmedTraits.filter((t) => t.state === 'no').length,
    dealbreakersWithNo,
  };
}

/**
 * Calculate the score for a single category (dealbreakers or desired).
 *
 * - Returns 100 if the category has no traits (perfect by default)
 * - Returns 0 if no traits are confirmed (starting point)
 * - Each "yes" adds 100/totalTraits points
 * - Each "no" subtracts (100/totalTraits) * lossAversion points
 * - Score is clamped to 0-100
 *
 * @param traits - Array of traits in this category
 * @param lossAversion - Multiplier for "no" penalty
 * @returns Score from 0-100
 */
export function calculateCategoryScore(traits: Trait[], lossAversion: number): number {
  if (traits.length === 0) return 100;

  const confirmed = traits.filter((t) => t.state !== 'unknown');
  if (confirmed.length === 0) return 0; // Start at 0 when no data

  let score = 0; // Start at 0
  const impactPerTrait = 100 / traits.length;

  confirmed.forEach((trait) => {
    if (trait.state === 'yes') {
      score += impactPerTrait;
    } else if (trait.state === 'no') {
      score -= impactPerTrait * lossAversion; // Loss aversion penalty
    }
  });

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get detailed score breakdown by category.
 *
 * @param traits - Array of traits for the prospect
 * @param strictness - Scoring strictness level
 * @returns Array of ScoreBreakdown for each category
 */
export function getScoreBreakdown(
  traits: Trait[],
  strictness: StrictnessLevel = 'normal'
): ScoreBreakdown[] {
  const lossAversion = STRICTNESS_SETTINGS[strictness];

  const dealbreakers = traits.filter((t) => t.attributeCategory === 'dealbreaker');
  const desired = traits.filter((t) => t.attributeCategory === 'desired');

  return [
    createBreakdown('dealbreaker', dealbreakers, lossAversion),
    createBreakdown('desired', desired, lossAversion),
  ];
}

function createBreakdown(
  category: 'dealbreaker' | 'desired',
  traits: Trait[],
  lossAversion: number
): ScoreBreakdown {
  const confirmed = traits.filter((t) => t.state !== 'unknown');
  const yesCount = confirmed.filter((t) => t.state === 'yes').length;
  const noCount = confirmed.filter((t) => t.state === 'no').length;

  return {
    category,
    total: traits.length,
    confirmed: confirmed.length,
    yesCount,
    noCount,
    score: Math.round(calculateCategoryScore(traits, lossAversion)),
  };
}

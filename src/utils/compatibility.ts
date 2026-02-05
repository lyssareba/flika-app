import type { Trait , CompatibilityScore, ScoreBreakdown } from '@/types';

interface ScoringConfig {
  dealbreakersWeight: number; // 0.6 (60%)
  desiredWeight: number; // 0.4 (40%)
  lossAversionCoefficient: number; // Varies by strictness setting
}

export type StrictnessLevel = 'gentle' | 'normal' | 'strict';

const STRICTNESS_SETTINGS: Record<StrictnessLevel, number> = {
  gentle: 1.5, // "No" has 1.5x impact
  normal: 2.0, // "No" has 2x impact (default)
  strict: 2.5, // "No" has 2.5x impact
};

const DEALBREAKERS_WEIGHT = 0.6;
const DESIRED_WEIGHT = 0.4;

/**
 * Calculate the compatibility score for a prospect based on their traits.
 *
 * The algorithm uses loss aversion from behavioral psychology:
 * - "No" responses are penalized more heavily than "Yes" responses reward
 * - Dealbreakers are weighted 60%, desired traits 40%
 * - Unknown traits don't affect the score (neutral)
 * - Score is clamped to 0-100
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
 * - Returns 50 if no traits are confirmed (neutral)
 * - Each "yes" adds points, each "no" subtracts points * lossAversion
 *
 * @param traits - Array of traits in this category
 * @param lossAversion - Multiplier for "no" penalty
 * @returns Score from 0-100
 */
export function calculateCategoryScore(traits: Trait[], lossAversion: number): number {
  if (traits.length === 0) return 100;

  const confirmed = traits.filter((t) => t.state !== 'unknown');
  if (confirmed.length === 0) return 50; // Neutral when no data

  let score = 50; // Start neutral
  const impactPerTrait = 50 / traits.length;

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

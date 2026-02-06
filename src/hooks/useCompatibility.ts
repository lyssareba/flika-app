import { useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  calculateCompatibility,
  getScoreBreakdown,
  type StrictnessLevel,
} from '@/utils/compatibility';
import type { Trait, CompatibilityScore, ScoreBreakdown } from '@/types';

interface UseCompatibilityReturn {
  /** Calculate compatibility score for given traits */
  calculateScore: (traits: Trait[]) => CompatibilityScore;
  /** Get detailed breakdown by category */
  getBreakdown: (traits: Trait[]) => ScoreBreakdown[];
  /** Current strictness setting from user profile */
  strictness: StrictnessLevel;
}

/**
 * Hook for calculating compatibility scores using the user's strictness setting.
 *
 * @example
 * const { calculateScore } = useCompatibility();
 * const score = calculateScore(prospect.traits);
 * console.log(score.overall); // 0-100
 *
 * @example
 * const { getBreakdown } = useCompatibility();
 * const breakdown = getBreakdown(prospect.traits);
 * // [{ category: 'dealbreaker', score: 75, ... }, { category: 'desired', score: 80, ... }]
 */
export const useCompatibility = (): UseCompatibilityReturn => {
  const { userProfile } = useAuth();

  const strictness = userProfile?.settings.scoringStrictness ?? 'normal';

  const calculateScore = useMemo(
    () => (traits: Trait[]) => calculateCompatibility(traits, strictness),
    [strictness]
  );

  const getBreakdown = useMemo(
    () => (traits: Trait[]) => getScoreBreakdown(traits, strictness),
    [strictness]
  );

  return {
    calculateScore,
    getBreakdown,
    strictness,
  };
};

import { useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { updateTrait } from '@/services/firebase/firestore';
import type { TraitState } from '@/types';

interface UseTraitsReturn {
  /** Update a trait's state */
  updateTraitState: (
    prospectId: string,
    traitId: string,
    state: TraitState
  ) => Promise<void>;
}

/**
 * Hook for managing trait operations.
 *
 * @example
 * const { updateTraitState } = useTraits();
 * await updateTraitState(prospectId, traitId, 'yes');
 */
export const useTraits = (): UseTraitsReturn => {
  const { user } = useAuthContext();

  const updateTraitState = useCallback(
    async (prospectId: string, traitId: string, state: TraitState): Promise<void> => {
      if (!user) throw new Error('User not authenticated');
      await updateTrait(user.uid, prospectId, traitId, state);
    },
    [user]
  );

  return {
    updateTraitState,
  };
};

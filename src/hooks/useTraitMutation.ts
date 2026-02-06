import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { updateTrait } from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { prospectKeys } from './useProspectQuery';
import type { Prospect, TraitState } from '@/types';

/**
 * Hook to update a trait with optimistic updates and automatic query invalidation.
 * Includes error handling with user feedback.
 */
export const useTraitMutation = (prospectId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      traitId,
      state,
    }: {
      traitId: string;
      state: TraitState;
    }) => {
      if (!user || !prospectId) throw new Error('Missing user or prospect');
      await updateTrait(user.uid, prospectId, traitId, state);
      return { traitId, state };
    },
    // Optimistic update
    onMutate: async ({ traitId, state }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: prospectKeys.detail(prospectId ?? ''),
      });

      // Snapshot the previous value
      const previousProspect = queryClient.getQueryData<Prospect>(
        prospectKeys.detail(prospectId ?? '')
      );

      // Optimistically update
      if (previousProspect) {
        queryClient.setQueryData<Prospect>(
          prospectKeys.detail(prospectId ?? ''),
          {
            ...previousProspect,
            traits: previousProspect.traits.map((trait) =>
              trait.id === traitId ? { ...trait, state, updatedAt: new Date() } : trait
            ),
          }
        );
      }

      return { previousProspect };
    },
    // Rollback on error and notify user
    onError: (error, _variables, context) => {
      // Rollback to previous state
      if (context?.previousProspect) {
        queryClient.setQueryData(
          prospectKeys.detail(prospectId ?? ''),
          context.previousProspect
        );
      }

      // Show error to user
      Alert.alert(
        'Update Failed',
        'Could not save trait change. Please try again.',
        [{ text: 'OK' }]
      );

      // Log error for debugging
      console.error('Trait mutation error:', error);
    },
    // Invalidate after success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: prospectKeys.detail(prospectId ?? ''),
      });
    },
  });
};

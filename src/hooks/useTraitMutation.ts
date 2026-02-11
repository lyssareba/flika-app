import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import i18n from 'i18next';
import { updateTrait, updateProspectCachedScore } from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';
import type { Prospect, TraitState } from '@/types';

/**
 * Hook to update a trait with optimistic updates and automatic query invalidation.
 * Includes error handling with user feedback.
 */
export const useTraitMutation = (prospectId: string | undefined) => {
  const { user, userProfile } = useAuth();
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
      const queryKey = queryKeys.prospects.detail(prospectId ?? '');

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousProspect = queryClient.getQueryData<Prospect>(queryKey);

      // Optimistically update
      if (previousProspect) {
        const now = new Date();
        queryClient.setQueryData<Prospect>(queryKey, {
          ...previousProspect,
          traits: previousProspect.traits.map((trait) =>
            trait.id === traitId
              ? {
                  ...trait,
                  state,
                  updatedAt: now,
                  confirmedAt: state === 'yes' ? now : undefined,
                }
              : trait
          ),
        });
      }

      return { previousProspect };
    },
    // Rollback on error and notify user
    onError: (error, _variables, context) => {
      // Rollback to previous state
      if (context?.previousProspect) {
        queryClient.setQueryData(
          queryKeys.prospects.detail(prospectId ?? ''),
          context.previousProspect
        );
      }

      // Show error to user
      Alert.alert(
        i18n.t('common:Update Failed'),
        i18n.t('common:Could not save trait change. Please try again.')
      );

      // Log error for debugging
      console.error('Trait mutation error:', error);
    },
    // Invalidate after success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prospects.detail(prospectId ?? ''),
      });
      // Also invalidate prospects list since updatedAt changes
      queryClient.invalidateQueries({
        queryKey: queryKeys.prospects.list(),
      });

      // Recompute and cache score on prospect document
      if (user && prospectId) {
        updateProspectCachedScore(
          user.uid,
          prospectId,
          userProfile?.settings?.scoringStrictness
        ).catch((err) => console.error('Failed to update cached score:', err));
      }
    },
  });
};

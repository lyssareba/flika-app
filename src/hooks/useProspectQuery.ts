import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProspect, updateTrait } from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import type { Prospect, TraitState } from '@/types';

// Query key factory for prospects
export const prospectKeys = {
  all: ['prospects'] as const,
  detail: (id: string) => [...prospectKeys.all, id] as const,
};

/**
 * Hook to fetch prospect details with TanStack Query caching.
 * Data is cached and only refetched when invalidated or stale.
 */
export const useProspectQuery = (prospectId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: prospectKeys.detail(prospectId ?? ''),
    queryFn: async (): Promise<Prospect | null> => {
      if (!user || !prospectId) return null;
      return getProspect(user.uid, prospectId);
    },
    enabled: !!user && !!prospectId,
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
  });
};

/**
 * Hook to update a trait with automatic query invalidation.
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
            traits: previousProspect.traits.map((t) =>
              t.id === traitId ? { ...t, state, updatedAt: new Date() } : t
            ),
          }
        );
      }

      return { previousProspect };
    },
    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousProspect) {
        queryClient.setQueryData(
          prospectKeys.detail(prospectId ?? ''),
          context.previousProspect
        );
      }
    },
    // Invalidate after success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: prospectKeys.detail(prospectId ?? ''),
      });
    },
  });
};

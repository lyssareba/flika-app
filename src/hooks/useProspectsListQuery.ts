import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  subscribeToProspects,
  type ProspectListData,
} from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';

/**
 * Hook to fetch prospects list with real-time Firestore subscription.
 * Uses TanStack Query for caching while maintaining real-time updates.
 *
 * The subscription updates the query cache directly, providing:
 * - Instant updates when data changes in Firestore
 * - Consistent caching behavior with other queries
 * - Automatic cleanup on unmount
 */
export const useProspectsListQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription that updates the query cache
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToProspects(
      user.uid,
      (prospects) => {
        // Update the query cache with fresh data from subscription
        queryClient.setQueryData(queryKeys.prospects.list(), prospects);
      },
      (error) => {
        console.error('Prospects subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, queryClient]);

  // Use query for initial data and cache management
  return useQuery({
    queryKey: queryKeys.prospects.list(),
    queryFn: async (): Promise<ProspectListData[]> => {
      // Return empty array - actual data comes from subscription
      // This prevents a race condition where query might return stale data
      return [];
    },
    enabled: !!user,
    // Don't refetch automatically since we have real-time updates
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

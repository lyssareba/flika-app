import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  subscribeToProspects,
  getActiveProspects,
  getArchivedProspects,
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
  // Extract userId to use as stable dependency
  const userId = user?.uid;

  // Set up real-time subscription that updates the query cache
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToProspects(
      userId,
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
  }, [userId, queryClient]);

  // Use query for initial data and cache management
  return useQuery({
    queryKey: queryKeys.prospects.list(),
    queryFn: async (): Promise<ProspectListData[]> => {
      if (!userId) return [];
      // Fetch prospects as fallback/initial data
      // The subscription will update the cache with real-time changes
      const [active, archived] = await Promise.all([
        getActiveProspects(userId),
        getArchivedProspects(userId),
      ]);
      // Combine and sort by updatedAt
      return [...active, ...archived].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    },
    enabled: !!userId,
    // Don't refetch automatically since we have real-time updates
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

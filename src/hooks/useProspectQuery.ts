import { useQuery } from '@tanstack/react-query';
import { getProspect } from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';
import type { Prospect } from '@/types';

/**
 * Hook to fetch a single prospect's details with TanStack Query caching.
 * Data is cached and only refetched when invalidated or stale.
 * Uses global staleTime from QueryClient config (5 minutes).
 */
export const useProspectQuery = (prospectId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.prospects.detail(prospectId ?? ''),
    queryFn: async (): Promise<Prospect | null> => {
      if (!user || !prospectId) return null;
      return getProspect(user.uid, prospectId);
    },
    enabled: !!user && !!prospectId,
  });
};

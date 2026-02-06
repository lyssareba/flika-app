import { useQuery } from '@tanstack/react-query';
import { getAttributes } from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';
import type { Attribute } from '@/types';

/**
 * Hook to fetch user's attributes with TanStack Query caching.
 */
export const useAttributesQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.attributes.list(),
    queryFn: async (): Promise<Attribute[]> => {
      if (!user) return [];
      return getAttributes(user.uid);
    },
    enabled: !!user,
  });
};

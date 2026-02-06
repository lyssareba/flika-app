import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/services/firebase/firestore';
import { queryKeys } from './queryKeys';
import type { UserProfile } from '@/types';

/**
 * Hook to fetch user profile with TanStack Query caching.
 * Unlike other queries, this takes uid directly since it's used
 * before AuthContext is fully initialized.
 */
export const useUserProfileQuery = (uid: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.user.profile(uid ?? ''),
    queryFn: async (): Promise<UserProfile | null> => {
      if (!uid) return null;
      return getUserProfile(uid);
    },
    enabled: !!uid,
  });
};

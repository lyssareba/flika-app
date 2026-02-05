import { useAuthContext } from '@/context/AuthContext';

/**
 * Convenience hook for accessing auth state and methods.
 */
export const useAuth = () => {
  return useAuthContext();
};

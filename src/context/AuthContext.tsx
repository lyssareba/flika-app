import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { User, deleteUser } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import {
  signUp as firebaseSignUp,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  resetPassword as firebaseResetPassword,
} from '@/services/firebase/auth';
import { createUserProfile, getUserProfile } from '@/services/firebase/firestore';
import { purchasesService } from '@/services/purchases';
import { queryKeys } from '@/hooks/queryKeys';
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  // Flag to skip profile fetch in onAuthStateChanged during signup
  const isSigningUp = useRef(false);

  // Initialize RevenueCat SDK
  useEffect(() => {
    purchasesService.initialize().catch(() => {
      // SDK init failure is non-fatal; purchases will be unavailable
    });
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        purchasesService.loginUser(firebaseUser.uid).catch(() => {
          // RevenueCat login failure is non-fatal
        });

        // Skip profile fetch if signup is handling it
        if (!isSigningUp.current) {
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
            // Also update the query cache
            if (profile) {
              queryClient.setQueryData(
                queryKeys.user.profile(firebaseUser.uid),
                profile
              );
            }
          } catch {
            setUserProfile(null);
          }
        }
      } else {
        purchasesService.logoutUser().catch(() => {
          // RevenueCat logout failure is non-fatal
        });
        setUserProfile(null);
        // Clear all query caches on sign out
        queryClient.clear();
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      // Also update the query cache
      if (profile) {
        queryClient.setQueryData(queryKeys.user.profile(user.uid), profile);
      }
    } catch {
      // Profile fetch failed, keep existing
    }
  }, [user, queryClient]);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      isSigningUp.current = true;
      let credential;

      try {
        credential = await firebaseSignUp(email, password, displayName);

        // Create user profile document in Firestore with default settings
        await createUserProfile(credential.user.uid, {
          displayName,
          email,
        });

        const profile = await getUserProfile(credential.user.uid);
        setUserProfile(profile);
        // Update query cache
        if (profile) {
          queryClient.setQueryData(
            queryKeys.user.profile(credential.user.uid),
            profile
          );
        }
      } catch (error) {
        // If auth succeeded but profile creation failed, clean up the auth user
        if (credential?.user) {
          try {
            await deleteUser(credential.user);
          } catch {
            // Best-effort cleanup
          }
        }
        throw error;
      } finally {
        isSigningUp.current = false;
      }
    },
    [queryClient]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    await firebaseSignIn(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await purchasesService.logoutUser().catch(() => {
      // RevenueCat logout failure is non-fatal
    });
    await firebaseSignOut();
    setUserProfile(null);
    // Clear all query caches
    queryClient.clear();
  }, [queryClient]);

  const resetPassword = useCallback(async (email: string) => {
    await firebaseResetPassword(email);
  }, []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      isLoading,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [user, userProfile, isLoading, signUp, signIn, signOut, resetPassword, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

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
import {
  signUp as firebaseSignUp,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  resetPassword as firebaseResetPassword,
} from '@/services/firebase/auth';
import { createUserProfile, getUserProfile } from '@/services/firebase/firestore';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Flag to skip profile fetch in onAuthStateChanged during signup
  const isSigningUp = useRef(false);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Skip profile fetch if signup is handling it
        if (!isSigningUp.current) {
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
          } catch {
            setUserProfile(null);
          }
        }
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch {
      // Profile fetch failed, keep existing
    }
  }, [user]);

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
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    await firebaseSignIn(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    setUserProfile(null);
  }, []);

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
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

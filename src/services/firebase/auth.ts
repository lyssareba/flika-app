import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  Unsubscribe,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }

  return credential;
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Get the currently signed-in user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }
  return updateProfile(user, updates);
}

// Social sign-in stubs (to be implemented when needed)

/**
 * Sign in with Google (stub - requires additional setup)
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  // TODO: Implement Google sign-in
  // Requires expo-auth-session and Google OAuth configuration
  throw new Error('Google sign-in not yet implemented');
}

/**
 * Sign in with Apple (stub - requires additional setup)
 */
export async function signInWithApple(): Promise<UserCredential> {
  // TODO: Implement Apple sign-in
  // Requires expo-apple-authentication and Apple Developer account setup
  throw new Error('Apple sign-in not yet implemented');
}

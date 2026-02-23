// Firebase configuration and instances
export { app, auth, db } from './config';

// Authentication services
export {
  signUp,
  signIn,
  signOut,
  onAuthStateChanged,
  resetPassword,
  getCurrentUser,
  updateUserProfile,
  signInWithGoogle,
  signInWithApple,
} from './auth';

// Firestore services
export {
  // User profile
  createUserProfile,
  getUserProfile,
  updateUserSettings,
  // Attributes
  createAttribute,
  getAttributes,
  updateAttribute,
  deleteAttribute,
  // Prospects
  createProspect,
  getProspect,
  getProspects,
  getActiveProspects,
  getArchivedProspects,
  updateProspect,
  archiveProspect,
  archiveOtherProspects,
  deleteProspect,
  getProspectSummary,
  resetArchiveTimer,
  // Traits
  updateTrait,
  updateProspectCachedScore,
  // Date entries
  addDateEntry,
  updateDateEntry,
  deleteDateEntry,
} from './firestore';

// Early Adopter services
export {
  getEarlyAdopterStatus,
  claimEarlyAdopterSlot,
  isUserEarlyAdopter,
  getEarlyAdopterSlot,
} from './earlyAdopterService';

// Cloud Functions (stubs)
export {
  triggerDatingRecap,
  cleanupExpiredProspects,
  sendArchiveExpirationWarning,
  exportUserData,
  scheduleAccountDeletion,
  cancelAccountDeletion,
} from './functions';

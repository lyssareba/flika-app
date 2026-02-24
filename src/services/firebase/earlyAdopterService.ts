import {
  doc,
  getDoc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { EARLY_ADOPTER_MAX_SLOTS } from '@/constants';

interface EarlyAdopterStatus {
  currentCount: number;
  maxSlots: number;
  isFull: boolean;
}

interface ClaimResult {
  success: boolean;
  slotNumber?: number;
}

const COUNTER_DOC_PATH = 'counters/earlyAdopters';

export const getEarlyAdopterStatus = async (): Promise<EarlyAdopterStatus> => {
  const counterRef = doc(db, COUNTER_DOC_PATH);
  const counterSnap = await getDoc(counterRef);

  const currentCount = counterSnap.exists() ? (counterSnap.data().count ?? 0) : 0;

  return {
    currentCount,
    maxSlots: EARLY_ADOPTER_MAX_SLOTS,
    isFull: currentCount >= EARLY_ADOPTER_MAX_SLOTS,
  };
};

export const claimEarlyAdopterSlot = async (userId: string): Promise<ClaimResult> => {
  const counterRef = doc(db, COUNTER_DOC_PATH);
  const profileRef = doc(db, 'users', userId, 'profile', 'main');

  return runTransaction(db, async (transaction) => {
    const [counterSnap, profileSnap] = await Promise.all([
      transaction.get(counterRef),
      transaction.get(profileRef),
    ]);

    // Idempotent: user already claimed
    if (profileSnap.exists() && profileSnap.data().isEarlyAdopter === true) {
      return {
        success: true,
        slotNumber: profileSnap.data().earlyAdopterSlot,
      };
    }

    const currentCount = counterSnap.exists() ? (counterSnap.data().count ?? 0) : 0;

    // No slots remaining
    if (currentCount >= EARLY_ADOPTER_MAX_SLOTS) {
      return { success: false };
    }

    const newCount = currentCount + 1;

    // Update counter
    if (counterSnap.exists()) {
      transaction.update(counterRef, { count: newCount });
    } else {
      transaction.set(counterRef, { count: newCount });
    }

    // Set early adopter fields on user profile
    transaction.update(profileRef, {
      isEarlyAdopter: true,
      earlyAdopterSlot: newCount,
      earlyAdopterClaimedAt: Timestamp.now(),
    });

    return { success: true, slotNumber: newCount };
  });
};

export const isUserEarlyAdopter = async (userId: string): Promise<boolean> => {
  const profileRef = doc(db, 'users', userId, 'profile', 'main');
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) return false;
  return profileSnap.data().isEarlyAdopter === true;
};

export const getEarlyAdopterSlot = async (userId: string): Promise<number | null> => {
  const profileRef = doc(db, 'users', userId, 'profile', 'main');
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) return null;
  return profileSnap.data().earlyAdopterSlot ?? null;
};

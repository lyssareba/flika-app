import {
  User,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from './config';
import { clearAllSecureStorage } from '@/services/storage/secureStorage';
import { clearAllUserStorage } from '@/services/storage/asyncStorage';

const BATCH_LIMIT = 499;

const commitIfFull = async (
  batch: ReturnType<typeof writeBatch>,
  count: number
): Promise<{ batch: ReturnType<typeof writeBatch>; count: number }> => {
  if (count >= BATCH_LIMIT) {
    await batch.commit();
    return { batch: writeBatch(db), count: 0 };
  }
  return { batch, count };
};

export const reauthenticateUser = async (
  user: User,
  password: string
): Promise<void> => {
  if (!user.email) {
    throw new Error('No email associated with this account');
  }
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
};

export const deleteAllUserData = async (userId: string): Promise<void> => {
  // Delete all prospects and their subcollections (traits + dates)
  const prospectsSnap = await getDocs(collection(db, 'users', userId, 'prospects'));

  let batch = writeBatch(db);
  let opCount = 0;

  for (const prospectDoc of prospectsSnap.docs) {
    // Delete traits subcollection
    const traitsSnap = await getDocs(collection(prospectDoc.ref, 'traits'));
    for (const traitDoc of traitsSnap.docs) {
      batch.delete(traitDoc.ref);
      opCount++;
      ({ batch, count: opCount } = await commitIfFull(batch, opCount));
    }

    // Delete dates subcollection
    const datesSnap = await getDocs(collection(prospectDoc.ref, 'dates'));
    for (const dateDoc of datesSnap.docs) {
      batch.delete(dateDoc.ref);
      opCount++;
      ({ batch, count: opCount } = await commitIfFull(batch, opCount));
    }

    // Delete the prospect document itself
    batch.delete(prospectDoc.ref);
    opCount++;
    ({ batch, count: opCount } = await commitIfFull(batch, opCount));
  }

  // Delete all attributes
  const attributesSnap = await getDocs(collection(db, 'users', userId, 'attributes'));
  for (const attrDoc of attributesSnap.docs) {
    batch.delete(attrDoc.ref);
    opCount++;
    ({ batch, count: opCount } = await commitIfFull(batch, opCount));
  }

  // Delete the profile/main document
  batch.delete(doc(db, 'users', userId, 'profile', 'main'));
  opCount++;

  if (opCount > 0) await batch.commit();
};

export const deleteAccount = async (
  user: User,
  password: string
): Promise<void> => {
  await reauthenticateUser(user, password);
  await deleteAllUserData(user.uid);
  await deleteUser(user);
  await clearAllSecureStorage(user.uid);
  await clearAllUserStorage(user.uid);
};

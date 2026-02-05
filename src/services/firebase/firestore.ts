import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentReference,
  CollectionReference,
  QueryConstraint,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import {
  UserProfile,
  UserSettings,
  Attribute,
  AttributeInput,
  Prospect,
  ProspectInput,
  Trait,
  TraitState,
  DateEntry,
} from '@/types';

// Helper to convert Firestore Timestamps to Dates
const toDate = (timestamp: Timestamp | Date): Date => {
  return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
};

// Helper to get user-scoped collection reference
const getUserCollection = (userId: string, collectionName: string): CollectionReference => {
  return collection(db, 'users', userId, collectionName);
};

// Helper to get user-scoped document reference
const getUserDoc = (userId: string, collectionName: string, docId: string): DocumentReference => {
  return doc(db, 'users', userId, collectionName, docId);
};

// ============================================================================
// User Profile Operations
// ============================================================================

export const createUserProfile = async (
  userId: string,
  data: { displayName: string; email: string }
): Promise<void> => {
  const defaultSettings: UserSettings = {
    scoringStrictness: 'normal',
    notificationsEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    recapFrequency: 'weekly',
    appLockEnabled: false,
    appLockTimeout: 10,
    biometricEnabled: false,
  };

  const profile = {
    displayName: data.displayName,
    email: data.email,
    createdAt: Timestamp.now(),
    settings: defaultSettings,
    onboardingCompleted: false,
  };

  await setDoc(doc(db, 'users', userId, 'profile', 'main'), profile);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', userId, 'profile', 'main');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: userId,
    displayName: data.displayName,
    email: data.email,
    createdAt: toDate(data.createdAt),
    settings: data.settings,
    onboardingCompleted: data.onboardingCompleted ?? false,
  };
};

export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'profile', 'main');

  // Use dot notation to merge settings instead of replacing the entire object
  const updateFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    updateFields[`settings.${key}`] = value;
  }

  await updateDoc(docRef, updateFields);
};

export const completeOnboarding = async (userId: string): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'profile', 'main');
  await updateDoc(docRef, { onboardingCompleted: true });
};

// ============================================================================
// Attributes Operations
// ============================================================================

export const createAttribute = async (
  userId: string,
  input: AttributeInput
): Promise<string> => {
  const colRef = getUserCollection(userId, 'attributes');
  const newDocRef = doc(colRef);

  const attribute = {
    name: input.name,
    category: input.category,
    createdAt: Timestamp.now(),
    order: Date.now(), // Use timestamp for ordering
  };

  await setDoc(newDocRef, attribute);
  return newDocRef.id;
};

export const getAttributes = async (userId: string): Promise<Attribute[]> => {
  const colRef = getUserCollection(userId, 'attributes');
  const q = query(colRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      category: data.category,
      createdAt: toDate(data.createdAt),
      order: data.order,
    };
  });
};

export const updateAttribute = async (
  userId: string,
  attributeId: string,
  updates: Partial<AttributeInput> & { order?: number }
): Promise<void> => {
  const docRef = getUserDoc(userId, 'attributes', attributeId);
  await updateDoc(docRef, updates);
};

export const deleteAttribute = async (
  userId: string,
  attributeId: string
): Promise<void> => {
  const docRef = getUserDoc(userId, 'attributes', attributeId);
  await deleteDoc(docRef);
};

// ============================================================================
// Prospects Operations
// ============================================================================

export const createProspect = async (
  userId: string,
  input: ProspectInput,
  attributes: Attribute[]
): Promise<string> => {
  const colRef = getUserCollection(userId, 'prospects');
  const newDocRef = doc(colRef);
  const now = Timestamp.now();

  const prospect = {
    name: input.name,
    photoUri: input.photoUri || null,
    status: input.hasMetInPerson ? 'dating' : 'talking',
    howWeMet: input.howWeMet || null,
    notes: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, prospect);

  // Create trait entries for all attributes
  const traitsColRef = collection(newDocRef, 'traits');
  for (const attr of attributes) {
    const traitDocRef = doc(traitsColRef);
    await setDoc(traitDocRef, {
      attributeId: attr.id,
      state: 'unknown',
      updatedAt: now,
    });
  }

  return newDocRef.id;
};

export const getProspect = async (
  userId: string,
  prospectId: string
): Promise<Prospect | null> => {
  const docRef = getUserDoc(userId, 'prospects', prospectId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();

  // Get traits
  const traits = await getProspectTraits(userId, prospectId);

  // Get dates
  const dates = await getProspectDates(userId, prospectId);

  return {
    id: docSnap.id,
    name: data.name,
    photoUri: data.photoUri || undefined,
    status: data.status,
    howWeMet: data.howWeMet || undefined,
    notes: data.notes || undefined,
    traits,
    dates,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    archivedAt: data.archivedAt ? toDate(data.archivedAt) : undefined,
  };
};

export const getProspects = async (
  userId: string,
  constraints: QueryConstraint[] = []
): Promise<Prospect[]> => {
  const colRef = getUserCollection(userId, 'prospects');
  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);

  // Fetch attributes once to avoid N+1 queries
  const attributes = await getAttributes(userId);
  const attributesMap = new Map(attributes.map((a) => [a.id, a]));

  const prospects: Prospect[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const traits = await getProspectTraits(userId, docSnap.id, attributesMap);
    const dates = await getProspectDates(userId, docSnap.id);

    prospects.push({
      id: docSnap.id,
      name: data.name,
      photoUri: data.photoUri || undefined,
      status: data.status,
      howWeMet: data.howWeMet || undefined,
      notes: data.notes || undefined,
      traits,
      dates,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      archivedAt: data.archivedAt ? toDate(data.archivedAt) : undefined,
    });
  }

  return prospects;
};

export const getActiveProspects = async (userId: string): Promise<Prospect[]> => {
  return getProspects(userId, [
    where('status', 'in', ['talking', 'dating', 'relationship']),
    orderBy('updatedAt', 'desc'),
  ]);
};

export const getArchivedProspects = async (userId: string): Promise<Prospect[]> => {
  return getProspects(userId, [
    where('status', '==', 'archived'),
    orderBy('archivedAt', 'desc'),
  ]);
};

export const updateProspect = async (
  userId: string,
  prospectId: string,
  updates: Partial<Omit<Prospect, 'id' | 'traits' | 'dates' | 'createdAt'>>
): Promise<void> => {
  const docRef = getUserDoc(userId, 'prospects', prospectId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const archiveProspect = async (
  userId: string,
  prospectId: string
): Promise<void> => {
  const docRef = getUserDoc(userId, 'prospects', prospectId);
  const docSnap = await getDoc(docRef);
  const currentStatus = docSnap.data()?.status;

  await updateDoc(docRef, {
    status: 'archived',
    previousStatus: currentStatus !== 'archived' ? currentStatus : null,
    archivedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const restoreProspect = async (
  userId: string,
  prospectId: string
): Promise<void> => {
  const docRef = getUserDoc(userId, 'prospects', prospectId);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  const restoredStatus = data?.previousStatus || 'dating';

  await updateDoc(docRef, {
    status: restoredStatus,
    previousStatus: null,
    archivedAt: null,
    updatedAt: Timestamp.now(),
  });
};

export const deleteProspect = async (
  userId: string,
  prospectId: string
): Promise<void> => {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);

  // Delete all traits in subcollection
  const traitsColRef = collection(prospectDocRef, 'traits');
  const traitsSnapshot = await getDocs(traitsColRef);

  // Delete all dates in subcollection
  const datesColRef = collection(prospectDocRef, 'dates');
  const datesSnapshot = await getDocs(datesColRef);

  // Use batch to delete everything atomically
  const batch = writeBatch(db);

  traitsSnapshot.docs.forEach((traitDoc) => {
    batch.delete(traitDoc.ref);
  });

  datesSnapshot.docs.forEach((dateDoc) => {
    batch.delete(dateDoc.ref);
  });

  batch.delete(prospectDocRef);

  await batch.commit();
};

// ============================================================================
// Real-time Listeners
// ============================================================================

export type ProspectListData = Omit<Prospect, 'traits' | 'dates'>;

export const subscribeToProspects = (
  userId: string,
  onData: (prospects: ProspectListData[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const colRef = getUserCollection(userId, 'prospects');
  const q = query(colRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const prospects: ProspectListData[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          photoUri: data.photoUri || undefined,
          status: data.status,
          previousStatus: data.previousStatus || undefined,
          howWeMet: data.howWeMet || undefined,
          notes: data.notes || undefined,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          archivedAt: data.archivedAt ? toDate(data.archivedAt) : undefined,
        };
      });
      onData(prospects);
    },
    onError
  );
};

// ============================================================================
// Traits Operations
// ============================================================================

const getProspectTraits = async (
  userId: string,
  prospectId: string,
  attributesMap?: Map<string, Attribute>
): Promise<Trait[]> => {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const traitsColRef = collection(prospectDocRef, 'traits');
  const snapshot = await getDocs(traitsColRef);

  // Use provided map or fetch attributes if not provided
  const attrMap =
    attributesMap ?? new Map((await getAttributes(userId)).map((a) => [a.id, a]));

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const attr = attrMap.get(data.attributeId);

    return {
      id: doc.id,
      attributeId: data.attributeId,
      attributeName: attr?.name || 'Unknown',
      attributeCategory: attr?.category || 'desired',
      state: data.state,
      updatedAt: toDate(data.updatedAt),
    };
  });
};

export const updateTrait = async (
  userId: string,
  prospectId: string,
  traitId: string,
  state: TraitState
): Promise<void> => {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const traitDocRef = doc(prospectDocRef, 'traits', traitId);

  await updateDoc(traitDocRef, {
    state,
    updatedAt: Timestamp.now(),
  });

  // Also update prospect's updatedAt
  await updateDoc(prospectDocRef, {
    updatedAt: Timestamp.now(),
  });
};

// ============================================================================
// Date Entries Operations
// ============================================================================

const getProspectDates = async (
  userId: string,
  prospectId: string
): Promise<DateEntry[]> => {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const datesColRef = collection(prospectDocRef, 'dates');
  const q = query(datesColRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      date: toDate(data.date),
      location: data.location || undefined,
      notes: data.notes || undefined,
      rating: data.rating || undefined,
      createdAt: toDate(data.createdAt),
    };
  });
};

export const addDateEntry = async (
  userId: string,
  prospectId: string,
  entry: Omit<DateEntry, 'id' | 'createdAt'>
): Promise<string> => {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const datesColRef = collection(prospectDocRef, 'dates');
  const newDocRef = doc(datesColRef);

  await setDoc(newDocRef, {
    date: Timestamp.fromDate(entry.date),
    location: entry.location || null,
    notes: entry.notes || null,
    rating: entry.rating || null,
    createdAt: Timestamp.now(),
  });

  // Update prospect's updatedAt and potentially status
  const prospectSnap = await getDoc(prospectDocRef);
  const prospectData = prospectSnap.data();

  const updates: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  // Auto-upgrade from 'talking' to 'dating' on first date
  if (prospectData?.status === 'talking') {
    updates.status = 'dating';
  }

  await updateDoc(prospectDocRef, updates);

  return newDocRef.id;
};

export const updateDateEntry = async (
  userId: string,
  prospectId: string,
  dateId: string,
  updates: Partial<Omit<DateEntry, 'id' | 'createdAt'>>
): Promise<void> => {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const dateDocRef = doc(prospectDocRef, 'dates', dateId);

  const updateData: Record<string, unknown> = {};
  if (updates.date) updateData.date = Timestamp.fromDate(updates.date);
  if (updates.location !== undefined) updateData.location = updates.location || null;
  if (updates.notes !== undefined) updateData.notes = updates.notes || null;
  if (updates.rating !== undefined) updateData.rating = updates.rating || null;

  await updateDoc(dateDocRef, updateData);
};

export const deleteDateEntry = async (
  userId: string,
  prospectId: string,
  dateId: string
): Promise<void> => {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const dateDocRef = doc(prospectDocRef, 'dates', dateId);
  await deleteDoc(dateDocRef);
};

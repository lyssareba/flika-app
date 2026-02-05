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
function toDate(timestamp: Timestamp | Date): Date {
  return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
}

// Helper to get user-scoped collection reference
function getUserCollection(userId: string, collectionName: string): CollectionReference {
  return collection(db, 'users', userId, collectionName);
}

// Helper to get user-scoped document reference
function getUserDoc(userId: string, collectionName: string, docId: string): DocumentReference {
  return doc(db, 'users', userId, collectionName, docId);
}

// ============================================================================
// User Profile Operations
// ============================================================================

export async function createUserProfile(
  userId: string,
  data: { displayName: string; email: string }
): Promise<void> {
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
  };

  await setDoc(doc(db, 'users', userId, 'profile', 'main'), profile);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
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
  };
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'profile', 'main');
  await updateDoc(docRef, {
    settings: settings,
  });
}

// ============================================================================
// Attributes Operations
// ============================================================================

export async function createAttribute(
  userId: string,
  input: AttributeInput
): Promise<string> {
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
}

export async function getAttributes(userId: string): Promise<Attribute[]> {
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
}

export async function updateAttribute(
  userId: string,
  attributeId: string,
  updates: Partial<AttributeInput>
): Promise<void> {
  const docRef = getUserDoc(userId, 'attributes', attributeId);
  await updateDoc(docRef, updates);
}

export async function deleteAttribute(
  userId: string,
  attributeId: string
): Promise<void> {
  const docRef = getUserDoc(userId, 'attributes', attributeId);
  await deleteDoc(docRef);
}

// ============================================================================
// Prospects Operations
// ============================================================================

export async function createProspect(
  userId: string,
  input: ProspectInput,
  attributes: Attribute[]
): Promise<string> {
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
}

export async function getProspect(
  userId: string,
  prospectId: string
): Promise<Prospect | null> {
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
}

export async function getProspects(
  userId: string,
  constraints: QueryConstraint[] = []
): Promise<Prospect[]> {
  const colRef = getUserCollection(userId, 'prospects');
  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);

  const prospects: Prospect[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const traits = await getProspectTraits(userId, docSnap.id);
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
}

export async function getActiveProspects(userId: string): Promise<Prospect[]> {
  return getProspects(userId, [
    where('status', 'in', ['talking', 'dating', 'relationship']),
    orderBy('updatedAt', 'desc'),
  ]);
}

export async function getArchivedProspects(userId: string): Promise<Prospect[]> {
  return getProspects(userId, [
    where('status', '==', 'archived'),
    orderBy('archivedAt', 'desc'),
  ]);
}

export async function updateProspect(
  userId: string,
  prospectId: string,
  updates: Partial<Omit<Prospect, 'id' | 'traits' | 'dates' | 'createdAt'>>
): Promise<void> {
  const docRef = getUserDoc(userId, 'prospects', prospectId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function archiveProspect(
  userId: string,
  prospectId: string
): Promise<void> {
  const docRef = getUserDoc(userId, 'prospects', prospectId);
  await updateDoc(docRef, {
    status: 'archived',
    archivedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProspect(
  userId: string,
  prospectId: string
): Promise<void> {
  // Note: In production, you'd want to delete subcollections (traits, dates) too
  // This requires either Cloud Functions or batch deletes
  const docRef = getUserDoc(userId, 'prospects', prospectId);
  await deleteDoc(docRef);
}

// ============================================================================
// Traits Operations
// ============================================================================

async function getProspectTraits(
  userId: string,
  prospectId: string
): Promise<Trait[]> {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const traitsColRef = collection(prospectDocRef, 'traits');
  const snapshot = await getDocs(traitsColRef);

  // We need to fetch attribute names for denormalization
  const attributes = await getAttributes(userId);
  const attrMap = new Map(attributes.map((a) => [a.id, a]));

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
}

export async function updateTrait(
  userId: string,
  prospectId: string,
  traitId: string,
  state: TraitState
): Promise<void> {
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
}

// ============================================================================
// Date Entries Operations
// ============================================================================

async function getProspectDates(
  userId: string,
  prospectId: string
): Promise<DateEntry[]> {
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
}

export async function addDateEntry(
  userId: string,
  prospectId: string,
  entry: Omit<DateEntry, 'id' | 'createdAt'>
): Promise<string> {
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
}

export async function updateDateEntry(
  userId: string,
  prospectId: string,
  dateId: string,
  updates: Partial<Omit<DateEntry, 'id' | 'createdAt'>>
): Promise<void> {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const dateDocRef = doc(prospectDocRef, 'dates', dateId);

  const updateData: Record<string, unknown> = {};
  if (updates.date) updateData.date = Timestamp.fromDate(updates.date);
  if (updates.location !== undefined) updateData.location = updates.location || null;
  if (updates.notes !== undefined) updateData.notes = updates.notes || null;
  if (updates.rating !== undefined) updateData.rating = updates.rating || null;

  await updateDoc(dateDocRef, updateData);
}

export async function deleteDateEntry(
  userId: string,
  prospectId: string,
  dateId: string
): Promise<void> {
  const prospectDocRef = getUserDoc(userId, 'prospects', prospectId);
  const dateDocRef = doc(prospectDocRef, 'dates', dateId);
  await deleteDoc(dateDocRef);
}

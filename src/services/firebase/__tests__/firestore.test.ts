import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  createProspect,
  updateProspect,
  archiveProspect,
  restoreProspect,
  deleteProspect,
  updateTrait,
  updateProspectCachedScore,
  addDateEntry,
  deleteDateEntry,
  createAttribute,
  deleteAttribute,
} from '../firestore';

// Cast mocked functions for type-safe mock control
const mockCollection = collection as jest.Mock;
const mockDoc = doc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockDeleteDoc = deleteDoc as jest.Mock;
const mockWriteBatch = writeBatch as jest.Mock;
const mockTimestampNow = Timestamp.now as jest.Mock;
const mockTimestampFromDate = Timestamp.fromDate as jest.Mock;

const userId = 'user-1';
const prospectId = 'prospect-1';

// Helper to create a mock doc snapshot
const mockDocSnap = (data: Record<string, unknown> | null, id = 'doc-1') => ({
  exists: () => data !== null,
  data: () => data,
  id,
  ref: { id, path: `mock/path/${id}` },
});

// Helper to create a mock query snapshot
const mockQuerySnap = (docs: { data: Record<string, unknown>; id: string }[]) => ({
  docs: docs.map((d) => ({
    id: d.id,
    data: () => d.data,
    ref: { id: d.id, path: `mock/path/${d.id}` },
  })),
  empty: docs.length === 0,
  size: docs.length,
});

beforeEach(() => {
  jest.clearAllMocks();

  // Default mock returns
  mockDoc.mockReturnValue({ id: 'new-doc-id', path: 'mock/path' });
  mockCollection.mockReturnValue({ id: 'mock-collection' });
  mockSetDoc.mockResolvedValue(undefined);
  mockUpdateDoc.mockResolvedValue(undefined);
  mockDeleteDoc.mockResolvedValue(undefined);
  mockTimestampNow.mockReturnValue({ toDate: () => new Date('2025-01-15') });
  mockTimestampFromDate.mockImplementation((date: Date) => ({
    toDate: () => date,
  }));

  // Default writeBatch mock
  const batchMock = {
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  };
  mockWriteBatch.mockReturnValue(batchMock);
});

// ============================================================================
// Prospect Operations
// ============================================================================

describe('createProspect', () => {
  it('creates doc with correct fields and creates trait subdocs', async () => {
    const input = {
      name: 'Jane Doe',
      hasMetInPerson: false,
      howWeMet: 'App',
      notes: 'Nice person',
    };
    const attributes = [
      {
        id: 'attr-1', name: 'Honesty', category: 'dealbreaker' as const,
        createdAt: new Date(), order: 1,
      },
      {
        id: 'attr-2', name: 'Humor', category: 'desired' as const,
        createdAt: new Date(), order: 2,
      },
    ];

    const result = await createProspect(userId, input, attributes);

    expect(result).toBe('new-doc-id');
    // setDoc called once for the prospect + once for each attribute trait
    expect(mockSetDoc).toHaveBeenCalledTimes(3);

    // First call creates the prospect document
    const prospectData = mockSetDoc.mock.calls[0][1];
    expect(prospectData.name).toBe('Jane Doe');
    expect(prospectData.status).toBe('talking'); // hasMetInPerson=false
    expect(prospectData.howWeMet).toBe('App');
    expect(prospectData.notes).toBe('Nice person');

    // Subsequent calls create trait entries
    const trait1Data = mockSetDoc.mock.calls[1][1];
    expect(trait1Data.attributeId).toBe('attr-1');
    expect(trait1Data.state).toBe('unknown');

    const trait2Data = mockSetDoc.mock.calls[2][1];
    expect(trait2Data.attributeId).toBe('attr-2');
    expect(trait2Data.state).toBe('unknown');
  });

  it('sets status to dating when hasMetInPerson is true', async () => {
    const input = { name: 'Bob', hasMetInPerson: true };
    await createProspect(userId, input, []);

    const prospectData = mockSetDoc.mock.calls[0][1];
    expect(prospectData.status).toBe('dating');
  });
});

describe('updateProspect', () => {
  it('calls updateDoc with correct path and data', async () => {
    await updateProspect(userId, prospectId, { name: 'Updated Name' });

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(updateData.name).toBe('Updated Name');
    expect(updateData.updatedAt).toBeDefined();
  });
});

describe('archiveProspect', () => {
  it('sets status to archived with previousStatus and archivedAt', async () => {
    mockGetDoc.mockResolvedValue(mockDocSnap({ status: 'dating' }));

    await archiveProspect(userId, prospectId);

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(updateData.status).toBe('archived');
    expect(updateData.previousStatus).toBe('dating');
    expect(updateData.archivedAt).toBeDefined();
  });
});

describe('restoreProspect', () => {
  it('restores previousStatus and clears archivedAt', async () => {
    mockGetDoc.mockResolvedValue(
      mockDocSnap({ status: 'archived', previousStatus: 'talking' })
    );

    await restoreProspect(userId, prospectId);

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(updateData.status).toBe('talking');
    expect(updateData.previousStatus).toBeNull();
    expect(updateData.archivedAt).toBeNull();
  });

  it('defaults to dating when no previousStatus', async () => {
    mockGetDoc.mockResolvedValue(
      mockDocSnap({ status: 'archived', previousStatus: null })
    );

    await restoreProspect(userId, prospectId);

    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(updateData.status).toBe('dating');
  });
});

describe('deleteProspect', () => {
  it('deletes prospect doc and all trait/date subdocs via batch', async () => {
    const traitDocs = [
      { id: 'trait-1', data: { state: 'yes' } },
      { id: 'trait-2', data: { state: 'no' } },
    ];
    const dateDocs = [{ id: 'date-1', data: { date: new Date() } }];

    // getDocs is called twice: once for traits, once for dates
    mockGetDocs
      .mockResolvedValueOnce(mockQuerySnap(traitDocs))
      .mockResolvedValueOnce(mockQuerySnap(dateDocs));

    await deleteProspect(userId, prospectId);

    const batch = mockWriteBatch.mock.results[0].value;
    // 2 trait deletes + 1 date delete + 1 prospect delete = 4
    expect(batch.delete).toHaveBeenCalledTimes(4);
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// Trait Operations
// ============================================================================

describe('updateTrait', () => {
  it('updates state and sets confirmedAt on yes', async () => {
    await updateTrait(userId, prospectId, 'trait-1', 'yes');

    // First updateDoc call is for the trait, second is for prospect updatedAt
    expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    const traitUpdate = mockUpdateDoc.mock.calls[0][1];
    expect(traitUpdate.state).toBe('yes');
    expect(traitUpdate.confirmedAt).toBeDefined();
  });

  it('clears confirmedAt on no', async () => {
    await updateTrait(userId, prospectId, 'trait-1', 'no');

    const traitUpdate = mockUpdateDoc.mock.calls[0][1];
    expect(traitUpdate.state).toBe('no');
    expect(traitUpdate.confirmedAt).toBeNull();
  });

  it('clears confirmedAt on unknown', async () => {
    await updateTrait(userId, prospectId, 'trait-1', 'unknown');

    const traitUpdate = mockUpdateDoc.mock.calls[0][1];
    expect(traitUpdate.state).toBe('unknown');
    expect(traitUpdate.confirmedAt).toBeNull();
  });
});

describe('updateProspectCachedScore', () => {
  it('computes and writes cachedScore, cachedDealbreakersWithNo, cachedUnknownDealbreakersCount', async () => {
    // Mock getProspectTraits (getDocs for traits, then getAttributes via getDocs)
    // The function internally calls getProspectTraits which calls getDocs for traits,
    // then getDocs for attributes
    const traitDocs = [
      {
        id: 't1',
        data: { attributeId: 'a1', state: 'yes', updatedAt: { toDate: () => new Date() } },
      },
      {
        id: 't2',
        data: { attributeId: 'a2', state: 'no', updatedAt: { toDate: () => new Date() } },
      },
    ];
    const attrDocs = [
      {
        id: 'a1',
        data: {
          name: 'Honesty', category: 'dealbreaker',
          createdAt: { toDate: () => new Date() }, order: 1,
        },
      },
      {
        id: 'a2',
        data: {
          name: 'Kindness', category: 'dealbreaker',
          createdAt: { toDate: () => new Date() }, order: 2,
        },
      },
    ];

    mockGetDocs
      .mockResolvedValueOnce(mockQuerySnap(traitDocs)) // traits subcollection
      .mockResolvedValueOnce(mockQuerySnap(attrDocs)); // attributes collection

    await updateProspectCachedScore(userId, prospectId, 'normal');

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(typeof updateData.cachedScore).toBe('number');
    expect(typeof updateData.cachedDealbreakersWithNo).toBe('number');
    expect(typeof updateData.cachedUnknownDealbreakersCount).toBe('number');
    // 2 dealbreaker traits: 1 yes, 1 no with 2.0 LA
    // dealbreakers: impact=50, yes+50, no-100 → 0 (clamped)
    // No desired traits → desiredScore = 100
    // Overall: 0 * 0.6 + 100 * 0.4 = 40
    expect(updateData.cachedScore).toBe(40);
    expect(updateData.cachedDealbreakersWithNo).toBe(1);
    expect(updateData.cachedUnknownDealbreakersCount).toBe(0);
  });
});

// ============================================================================
// Date Entry Operations
// ============================================================================

describe('addDateEntry', () => {
  it('adds date doc and updates cachedLastDateAt', async () => {
    const dateEntry = {
      date: new Date('2025-01-10'),
      location: 'Coffee Shop',
      notes: 'Great date',
      rating: 4,
    };

    // getDoc for prospect data (to check status and existing cachedLastDateAt)
    mockGetDoc.mockResolvedValue(
      mockDocSnap({ status: 'dating', cachedLastDateAt: null })
    );

    const result = await addDateEntry(userId, prospectId, dateEntry);

    expect(result).toBe('new-doc-id');
    // setDoc for date doc
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const dateData = mockSetDoc.mock.calls[0][1];
    expect(dateData.location).toBe('Coffee Shop');
    expect(dateData.notes).toBe('Great date');
    expect(dateData.rating).toBe(4);

    // updateDoc for prospect (cachedLastDateAt + updatedAt)
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const prospectUpdate = mockUpdateDoc.mock.calls[0][1];
    expect(prospectUpdate.cachedLastDateAt).toBeDefined();
    expect(prospectUpdate.updatedAt).toBeDefined();
  });

  it('auto-upgrades talking to dating status', async () => {
    mockGetDoc.mockResolvedValue(
      mockDocSnap({ status: 'talking', cachedLastDateAt: null })
    );

    await addDateEntry(userId, prospectId, {
      date: new Date('2025-01-10'),
    });

    const prospectUpdate = mockUpdateDoc.mock.calls[0][1];
    expect(prospectUpdate.status).toBe('dating');
  });

  it('does not downgrade dating to talking status', async () => {
    mockGetDoc.mockResolvedValue(
      mockDocSnap({ status: 'dating', cachedLastDateAt: null })
    );

    await addDateEntry(userId, prospectId, {
      date: new Date('2025-01-10'),
    });

    const prospectUpdate = mockUpdateDoc.mock.calls[0][1];
    expect(prospectUpdate.status).toBeUndefined();
  });
});

describe('deleteDateEntry', () => {
  it('deletes date doc and recalculates cachedLastDateAt from remaining dates', async () => {
    // Use plain Date objects — the toDate helper in firestore.ts passes them through as-is
    const remainingDates = [
      {
        id: 'd2',
        data: {
          date: new Date('2025-01-05'),
          createdAt: new Date('2025-01-05'),
        },
      },
      {
        id: 'd3',
        data: {
          date: new Date('2025-01-08'),
          createdAt: new Date('2025-01-08'),
        },
      },
    ];

    // getDocs for remaining dates (called by getProspectDates internally, with orderBy)
    mockGetDocs.mockResolvedValue(mockQuerySnap(remainingDates));

    await deleteDateEntry(userId, prospectId, 'date-1');

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);

    // Verify Timestamp.fromDate was called with the most recent remaining date (Jan 8)
    const fromDateCalls = mockTimestampFromDate.mock.calls;
    const lastFromDateArg = fromDateCalls[fromDateCalls.length - 1][0];
    expect(lastFromDateArg).toEqual(new Date('2025-01-08'));
  });

  it('sets cachedLastDateAt to null when no remaining dates', async () => {
    mockGetDocs.mockResolvedValue(mockQuerySnap([]));

    await deleteDateEntry(userId, prospectId, 'date-1');

    const updateData = mockUpdateDoc.mock.calls[0][1];
    expect(updateData.cachedLastDateAt).toBeNull();
  });
});

// ============================================================================
// Attribute Operations
// ============================================================================

describe('createAttribute', () => {
  it('creates doc with correct fields and ordering', async () => {
    const input = { name: 'Honesty', category: 'dealbreaker' as const };

    const result = await createAttribute(userId, input);

    expect(result).toBe('new-doc-id');
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const attrData = mockSetDoc.mock.calls[0][1];
    expect(attrData.name).toBe('Honesty');
    expect(attrData.category).toBe('dealbreaker');
    expect(typeof attrData.order).toBe('number');
  });
});

describe('deleteAttribute', () => {
  it('deletes the attribute document', async () => {
    await deleteAttribute(userId, 'attr-1');

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});

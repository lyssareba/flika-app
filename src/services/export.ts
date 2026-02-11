import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAttributes, getProspects, getProspect } from '@/services/firebase/firestore';
import type { UserProfile } from '@/types';
import type { ExportData, ProspectExportData } from '@/types/export';

/**
 * Recursively convert Date objects to ISO strings in any value.
 */
const serializeDates = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeDates);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeDates(val);
    }
    return result;
  }
  return value;
};

const todayString = () => new Date().toISOString().split('T')[0];

/**
 * Write JSON data to a temp file and open the system share sheet.
 */
const shareJsonFile = async (data: unknown, fileName: string): Promise<void> => {
  const json = JSON.stringify(data, null, 2);
  const file = new File(Paths.cache, fileName);

  file.write(json);

  try {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
  } finally {
    try {
      if (file.exists) {
        file.delete();
      }
    } catch {
      // Ignore cleanup errors
    }
  }
};

/**
 * Gather all user data into an ExportData object.
 */
export const gatherExportData = async (
  userId: string,
  userProfile: UserProfile
): Promise<ExportData> => {
  const [attributes, prospects] = await Promise.all([
    getAttributes(userId),
    getProspects(userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    user: {
      email: userProfile.email,
      createdAt: userProfile.createdAt.toISOString(),
      settings: userProfile.settings,
    },
    attributes: serializeDates(attributes) as ExportData['attributes'],
    prospects: serializeDates(prospects) as ExportData['prospects'],
  };
};

/**
 * Share full account export as flika-account-export-YYYY-MM-DD.json.
 */
export const shareAccountExport = async (data: ExportData): Promise<void> => {
  await shareJsonFile(data, `flika-account-export-${todayString()}.json`);
};

/**
 * Gather a single prospect's data into a ProspectExportData object.
 */
export const gatherProspectExportData = async (
  userId: string,
  prospectId: string
): Promise<ProspectExportData> => {
  const prospect = await getProspect(userId, prospectId);
  if (!prospect) {
    throw new Error('Prospect not found');
  }

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    prospect: serializeDates(prospect) as ProspectExportData['prospect'],
  };
};

/**
 * Share single prospect export as flika-prospect-$id-export-YYYY-MM-DD.json.
 */
export const shareProspectExport = async (data: ProspectExportData, prospectId: string): Promise<void> => {
  await shareJsonFile(data, `flika-prospect-${prospectId}-export-${todayString()}.json`);
};

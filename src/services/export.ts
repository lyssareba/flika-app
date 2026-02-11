import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAttributes, getProspects } from '@/services/firebase/firestore';
import type { UserProfile } from '@/types';
import type { ExportData } from '@/types/export';

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

  const data: ExportData = {
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

  return data;
};

/**
 * Write export data to a temp JSON file and open the system share sheet.
 */
export const shareExportFile = async (data: ExportData): Promise<void> => {
  const json = JSON.stringify(data, null, 2);
  const date = new Date().toISOString().split('T')[0];
  const fileName = `flika-export-${date}.json`;
  const file = new File(Paths.cache, fileName);

  file.write(json);

  try {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
  } finally {
    // Clean up temp file
    if (file.exists) {
      file.delete();
    }
  }
};

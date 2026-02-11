import type { UserSettings } from './user';
import type { Attribute } from './attribute';
import type { Prospect } from './prospect';

export interface ExportData {
  exportedAt: string; // ISO date string
  version: string; // "1.0"
  user: {
    email: string;
    createdAt: string; // ISO date string
    settings: UserSettings;
  };
  attributes: Attribute[];
  prospects: Prospect[]; // Includes traits[] and dates[]
}

export interface ProspectExportData {
  exportedAt: string; // ISO date string
  version: string; // "1.0"
  prospect: Prospect; // Includes traits[] and dates[]
}

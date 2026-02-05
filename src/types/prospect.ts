import { AttributeCategory } from './attribute';

export type ProspectStatus = 'talking' | 'dating' | 'archived' | 'relationship';
export type TraitState = 'unknown' | 'yes' | 'no';

export interface Trait {
  id: string;
  attributeId: string;
  attributeName: string; // Denormalized for display
  attributeCategory: AttributeCategory;
  state: TraitState;
  updatedAt: Date;
}

export interface DateEntry {
  id: string;
  date: Date;
  location?: string;
  notes?: string;
  rating?: number; // 1-5 optional
  createdAt: Date;
}

export interface Prospect {
  id: string;
  name: string;
  photoUri?: string;
  status: ProspectStatus;
  previousStatus?: ProspectStatus; // Stored when archived for restore
  howWeMet?: string;
  notes?: string;
  traits: Trait[];
  dates: DateEntry[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export interface ProspectInput {
  name: string;
  photoUri?: string;
  howWeMet?: string;
  hasMetInPerson: boolean; // Determines initial status
}

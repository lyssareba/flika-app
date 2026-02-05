import { ProspectStatus } from '@/types';

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  talking: 'prospect:Talking',
  dating: 'prospect:Dating',
  archived: 'prospect:Archived',
  relationship: 'prospect:In a Relationship',
};

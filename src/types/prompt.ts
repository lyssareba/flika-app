import type { MascotState } from '@/components/mascot';

export type PromptType = 'date_reminder' | 'dealbreaker_check' | 'milestone' | 'general_tip';

export interface InAppPrompt {
  id: string;
  type: PromptType;
  priority: number;
  prospectId?: string;
  prospectName?: string;
  mascotState: MascotState;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  dismissalKey: string;
}

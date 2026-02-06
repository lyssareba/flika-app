import type { StrictnessLevel } from '@/utils/compatibility';

export interface UserSettings {
  scoringStrictness: StrictnessLevel;
  notificationsEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  recapFrequency: 'weekly' | 'biweekly' | 'monthly';
  appLockEnabled: boolean;
  appLockTimeout: number;
  biometricEnabled: boolean;
  useCheckboxView?: boolean; // Defaults to false
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: Date;
  settings: UserSettings;
  onboardingCompleted: boolean;
}

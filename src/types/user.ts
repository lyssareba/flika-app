export interface UserSettings {
  scoringStrictness: 'gentle' | 'normal' | 'strict';
  notificationsEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  recapFrequency: 'weekly' | 'biweekly' | 'monthly';
  appLockEnabled: boolean;
  appLockTimeout: number;
  biometricEnabled: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: Date;
  settings: UserSettings;
  onboardingCompleted: boolean;
}

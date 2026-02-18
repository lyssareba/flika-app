import Constants from 'expo-constants';

export interface EnvConfig {
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  revenuecatAndroidApiKey: string;
  revenuecatIosApiKey: string;
  easProjectId: string;
  appVariant: string;
  isDev: boolean;
  isPreview: boolean;
  isProd: boolean;
}

const extra = Constants.expoConfig?.extra;

const REQUIRED_FIREBASE_KEYS = [
  'firebaseApiKey',
  'firebaseAuthDomain',
  'firebaseProjectId',
  'firebaseStorageBucket',
  'firebaseMessagingSenderId',
  'firebaseAppId',
] as const;

const missingKeys = REQUIRED_FIREBASE_KEYS.filter((key) => !extra?.[key]);
if (missingKeys.length > 0) {
  console.warn(
    `[env] Missing required Firebase config: ${missingKeys.join(', ')}. ` +
      'Make sure you have a .env file with the required variables.'
  );
}

const appVariant = (extra?.appVariant as string) ?? 'production';

export const env: EnvConfig = {
  firebaseApiKey: (extra?.firebaseApiKey as string) ?? '',
  firebaseAuthDomain: (extra?.firebaseAuthDomain as string) ?? '',
  firebaseProjectId: (extra?.firebaseProjectId as string) ?? '',
  firebaseStorageBucket: (extra?.firebaseStorageBucket as string) ?? '',
  firebaseMessagingSenderId: (extra?.firebaseMessagingSenderId as string) ?? '',
  firebaseAppId: (extra?.firebaseAppId as string) ?? '',
  revenuecatAndroidApiKey: (extra?.revenuecatAndroidApiKey as string) ?? '',
  revenuecatIosApiKey: (extra?.revenuecatIosApiKey as string) ?? '',
  easProjectId: (extra?.eas?.projectId as string) ?? '',
  appVariant,
  isDev: appVariant === 'development',
  isPreview: appVariant === 'preview',
  isProd: appVariant === 'production',
};

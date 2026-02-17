import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getAppName = () => {
  if (IS_DEV) return 'Flika (Dev)';
  if (IS_PREVIEW) return 'Flika (Preview)';
  return 'Flika';
};

const getPackageName = () => {
  if (IS_DEV) return 'com.getflika.flika.dev';
  if (IS_PREVIEW) return 'com.getflika.flika.preview';
  return 'com.getflika.flika';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'flika',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'flika',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getPackageName(),
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    package: getPackageName(),
    versionCode: 1,
    permissions: [
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
    blockedPermissions: ['android.permission.READ_PHONE_STATE', 'android.permission.RECORD_AUDIO'],
    ...(IS_DEV && {
      googleServicesFile: './google-services-dev.json',
    }),
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-secure-store',
    'expo-local-authentication',
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
        },
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Flika to access your camera to take photos.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Flika to access your photos to add images.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    revenuecatAndroidApiKey: process.env.REVENUECAT_ANDROID_API_KEY,
    revenuecatIosApiKey: process.env.REVENUECAT_IOS_API_KEY,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
    appVariant: process.env.APP_VARIANT ?? 'production',
  },
});

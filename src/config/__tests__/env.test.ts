describe('env config', () => {
  const originalWarn = console.warn;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn = originalWarn;
    warnSpy.mockRestore();
  });

  function loadEnvWith(extra: Record<string, unknown>) {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { expoConfig: { extra } },
    }));
    return require('../env') as typeof import('../env');
  }

  it('warns when required Firebase keys are missing', () => {
    loadEnvWith({});
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[env] Missing required Firebase config')
    );
  });

  it('does not warn when all Firebase keys are present', () => {
    loadEnvWith({
      firebaseApiKey: 'key',
      firebaseAuthDomain: 'domain',
      firebaseProjectId: 'project',
      firebaseStorageBucket: 'bucket',
      firebaseMessagingSenderId: 'sender',
      firebaseAppId: 'app',
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('sets isDev=true for development variant', () => {
    const { env } = loadEnvWith({ appVariant: 'development' });
    expect(env.isDev).toBe(true);
    expect(env.isPreview).toBe(false);
    expect(env.isProd).toBe(false);
  });

  it('sets isPreview=true for preview variant', () => {
    const { env } = loadEnvWith({ appVariant: 'preview' });
    expect(env.isDev).toBe(false);
    expect(env.isPreview).toBe(true);
    expect(env.isProd).toBe(false);
  });

  it('defaults to production when appVariant is unset', () => {
    const { env } = loadEnvWith({});
    expect(env.appVariant).toBe('production');
    expect(env.isProd).toBe(true);
    expect(env.isDev).toBe(false);
    expect(env.isPreview).toBe(false);
  });

  it('provides all config fields from extra', () => {
    const { env } = loadEnvWith({
      firebaseApiKey: 'ak',
      firebaseAuthDomain: 'ad',
      firebaseProjectId: 'pid',
      firebaseStorageBucket: 'sb',
      firebaseMessagingSenderId: 'sid',
      firebaseAppId: 'aid',
      revenuecatAndroidApiKey: 'rc-android',
      revenuecatIosApiKey: 'rc-ios',
      eas: { projectId: 'eas-pid' },
      appVariant: 'development',
    });

    expect(env.firebaseApiKey).toBe('ak');
    expect(env.firebaseAuthDomain).toBe('ad');
    expect(env.firebaseProjectId).toBe('pid');
    expect(env.firebaseStorageBucket).toBe('sb');
    expect(env.firebaseMessagingSenderId).toBe('sid');
    expect(env.firebaseAppId).toBe('aid');
    expect(env.revenuecatAndroidApiKey).toBe('rc-android');
    expect(env.revenuecatIosApiKey).toBe('rc-ios');
    expect(env.easProjectId).toBe('eas-pid');
    expect(env.appVariant).toBe('development');
  });

  it('defaults missing values to empty strings', () => {
    const { env } = loadEnvWith({});
    expect(env.firebaseApiKey).toBe('');
    expect(env.revenuecatAndroidApiKey).toBe('');
    expect(env.easProjectId).toBe('');
  });
});

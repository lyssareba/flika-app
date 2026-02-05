module.exports = {
  locales: ['en'],
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{ts,tsx}'],
  namespaceSeparator: ':',
  keySeparator: false,
  defaultNamespace: 'common',
  defaultValue: (locale, namespace, key) => key,
  sort: true,
  createOldCatalogs: false,
  failOnWarnings: false,
  verbose: false,
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import enCommon from './locales/en/common.json';
import enProspect from './locales/en/prospect.json';
import enTraits from './locales/en/traits.json';
import enSettings from './locales/en/settings.json';
import enOnboarding from './locales/en/onboarding.json';
import enPrompts from './locales/en/prompts.json';
import enPurchases from './locales/en/purchases.json';

const resources = {
  en: {
    common: enCommon,
    prospect: enProspect,
    traits: enTraits,
    settings: enSettings,
    onboarding: enOnboarding,
    prompts: enPrompts,
    purchases: enPurchases,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
  fallbackLng: 'en',
  ns: ['common', 'prospect', 'traits', 'settings', 'onboarding', 'prompts', 'purchases'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

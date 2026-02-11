import { colors } from '@/theme/colors';

export type MascotState =
  | 'idle'
  | 'happy'
  | 'celebrating'
  | 'thinking'
  | 'supportive'
  | 'sleepy'
  | 'excited'
  | 'curious';

export type EyeVariant = 'normal' | 'happy' | 'closed' | 'wide' | 'sparkle';
export type MouthVariant = 'neutral' | 'smile' | 'open' | 'small' | 'grin';
export type Accessory = 'sparkles' | 'eyebrow' | 'question' | 'zzz' | null;

export interface MascotStateConfig {
  bodyFill: string;
  innerFill: string;
  glowOpacity: number;
  bodyScale: number;
  bodyRotation: number;
  eyeVariant: EyeVariant;
  mouthVariant: MouthVariant;
  accessory: Accessory;
}

export const STATE_CONFIGS: Record<MascotState, MascotStateConfig> = {
  idle: {
    bodyFill: colors.primary[500],
    innerFill: colors.primary[200],
    glowOpacity: 0,
    bodyScale: 1.0,
    bodyRotation: 0,
    eyeVariant: 'normal',
    mouthVariant: 'neutral',
    accessory: null,
  },
  happy: {
    bodyFill: colors.primary[400],
    innerFill: colors.accent[500],
    glowOpacity: 0.15,
    bodyScale: 1.0,
    bodyRotation: 0,
    eyeVariant: 'happy',
    mouthVariant: 'smile',
    accessory: null,
  },
  celebrating: {
    bodyFill: colors.primary[400],
    innerFill: colors.accent[400],
    glowOpacity: 0.25,
    bodyScale: 1.12,
    bodyRotation: 0,
    eyeVariant: 'sparkle',
    mouthVariant: 'grin',
    accessory: 'sparkles',
  },
  thinking: {
    bodyFill: colors.primary[600],
    innerFill: colors.primary[300],
    glowOpacity: 0,
    bodyScale: 1.0,
    bodyRotation: 0,
    eyeVariant: 'normal',
    mouthVariant: 'small',
    accessory: 'eyebrow',
  },
  supportive: {
    bodyFill: colors.primary[500],
    innerFill: colors.accent[300],
    glowOpacity: 0.1,
    bodyScale: 1.0,
    bodyRotation: 0,
    eyeVariant: 'normal',
    mouthVariant: 'small',
    accessory: null,
  },
  sleepy: {
    bodyFill: colors.primary[700],
    innerFill: colors.primary[300],
    glowOpacity: 0,
    bodyScale: 0.9,
    bodyRotation: 0,
    eyeVariant: 'closed',
    mouthVariant: 'small',
    accessory: 'zzz',
  },
  excited: {
    bodyFill: colors.primary[400],
    innerFill: colors.accent[500],
    glowOpacity: 0.25,
    bodyScale: 1.08,
    bodyRotation: 0,
    eyeVariant: 'wide',
    mouthVariant: 'open',
    accessory: null,
  },
  curious: {
    bodyFill: colors.primary[500],
    innerFill: colors.primary[200],
    glowOpacity: 0,
    bodyScale: 1.0,
    bodyRotation: -12,
    eyeVariant: 'wide',
    mouthVariant: 'small',
    accessory: 'question',
  },
};

export interface MascotContext {
  compatibilityScore: number | null;
  isNewProspect?: boolean;
  isRelationship?: boolean;
  isFirstDate?: boolean;
  isMilestone?: boolean;
  allDealbreakersConfirmed?: boolean;
  isLoading?: boolean;
  isTraitsScreen?: boolean;
  unknownRatio?: number;
  positiveTraitConfirmed?: boolean;
  dealBreakerNo?: boolean;
  lowActivity?: boolean;
}

export const getMascotState = (context: MascotContext): MascotState => {
  // Priority-ordered resolution
  if (
    context.isRelationship ||
    context.isFirstDate ||
    context.isMilestone ||
    context.allDealbreakersConfirmed
  ) {
    return 'celebrating';
  }

  if (context.isNewProspect) {
    return 'excited';
  }

  if (context.isLoading) {
    return 'thinking';
  }

  if ((context.unknownRatio ?? 0) > 0.5) {
    return context.isTraitsScreen ? 'curious' : 'thinking';
  }

  if (
    (context.compatibilityScore !== null && context.compatibilityScore >= 80) ||
    context.positiveTraitConfirmed
  ) {
    return 'happy';
  }

  if (
    (context.compatibilityScore !== null && context.compatibilityScore < 40) ||
    context.dealBreakerNo
  ) {
    return 'supportive';
  }

  if (context.lowActivity) {
    return 'sleepy';
  }

  return 'idle';
};

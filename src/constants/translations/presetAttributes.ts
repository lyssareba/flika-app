/**
 * Preset attributes for onboarding suggestions
 * These are shown to users during attribute setup
 */
export const PRESET_ATTRIBUTES = [
  // Personality
  'Kind',
  'Honest',
  'Funny',
  'Ambitious',
  'Loyal',
  'Patient',
  'Adventurous',
  'Creative',
  'Confident',
  'Empathetic',
  'Optimistic',
  'Open-minded',
  'Reliable',
  'Thoughtful',
  'Humble',

  // Values
  'Family-oriented',
  'Career-driven',
  'Spiritual',
  'Health-conscious',
  'Environmentally aware',
  'Politically engaged',
  'Community-minded',

  // Lifestyle
  'Active lifestyle',
  'Homebody',
  'Social butterfly',
  'Traveler',
  'Foodie',
  'Pet lover',
  'Morning person',
  'Night owl',

  // Life goals
  'Wants kids',
  'Wants marriage',
  'Open to relocation',
  'Financially stable',
  'Established career',

  // Relationship style
  'Good communicator',
  'Physically affectionate',
  'Quality time focused',
  'Gift giver',
  'Acts of service',
  'Emotionally available',
] as const;

export type PresetAttribute = (typeof PRESET_ATTRIBUTES)[number];

/**
 * Get a random subset of preset attributes for suggestions
 */
export const getRandomPresets = (count: number = 5, exclude: string[] = []): string[] => {
  const available = PRESET_ATTRIBUTES.filter((attr) => !exclude.includes(attr));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

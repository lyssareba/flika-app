export interface CompatibilityScore {
  overall: number; // 0-100
  dealbreakersScore: number; // 0-100
  desiredScore: number; // 0-100
  unknownCount: number;
  confirmedYesCount: number;
  confirmedNoCount: number;
  dealbreakersWithNo: string[]; // Names of dealbreaker traits marked "no"
}

export interface ScoreBreakdown {
  category: 'dealbreaker' | 'desired';
  total: number;
  confirmed: number;
  yesCount: number;
  noCount: number;
  score: number;
}

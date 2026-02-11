const RETENTION_MONTHS = 12;
const WARNING_MONTHS = 11;

/**
 * Get the number of full months remaining before archived data expires.
 */
export const getMonthsUntilExpiry = (archivedAt: Date): number => {
  const now = new Date();
  const expiryDate = new Date(archivedAt);
  expiryDate.setMonth(expiryDate.getMonth() + RETENTION_MONTHS);

  const diffMs = expiryDate.getTime() - now.getTime();
  if (diffMs <= 0) return 0;

  // Calculate months remaining
  const diffMonths =
    (expiryDate.getFullYear() - now.getFullYear()) * 12 +
    (expiryDate.getMonth() - now.getMonth());

  return Math.max(0, diffMonths);
};

/**
 * Returns true if less than 1 month remains before expiry.
 */
export const isExpiringSoon = (archivedAt: Date): boolean => {
  return getMonthsUntilExpiry(archivedAt) < 1;
};

/**
 * Returns true if 1-2 months remain (approaching expiry but not yet critical).
 */
export const isApproachingExpiry = (archivedAt: Date): boolean => {
  const months = getMonthsUntilExpiry(archivedAt);
  return months >= 1 && months <= (RETENTION_MONTHS - WARNING_MONTHS + 1);
};

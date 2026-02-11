const RETENTION_MONTHS = 12;
const WARNING_MONTHS = 11;

/**
 * Get the number of full months remaining before archived data expires.
 * Uses day-aware calculation to avoid calendar month boundary inaccuracies.
 */
export const getMonthsUntilExpiry = (archivedAt: Date): number => {
  const now = new Date();
  const expiryDate = new Date(archivedAt);
  expiryDate.setMonth(expiryDate.getMonth() + RETENTION_MONTHS);

  const diffMs = expiryDate.getTime() - now.getTime();
  if (diffMs <= 0) return 0;

  // Use day-aware month calculation to avoid edge cases
  // (e.g. April 1 vs March 30 should be 0 months, not 1)
  let months =
    (expiryDate.getFullYear() - now.getFullYear()) * 12 +
    (expiryDate.getMonth() - now.getMonth());

  // Adjust if we haven't reached the same day-of-month yet
  if (expiryDate.getDate() < now.getDate()) {
    months--;
  }

  return Math.max(0, months);
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

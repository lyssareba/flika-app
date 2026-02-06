import type { DateEntry, Trait } from '@/types/prospect';

/**
 * Format a date as "January 28, 2026"
 */
export const formatDateLong = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get relative time string: "Today", "Yesterday", "3 days ago", "1 week ago", "2 months ago"
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
};

/**
 * Get month/year key for grouping: "January 2026"
 */
const getMonthKey = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
};

/**
 * Group dates by month, sorted by date descending within each group
 */
export const groupDatesByMonth = (
  dates: DateEntry[]
): Map<string, DateEntry[]> => {
  const groups = new Map<string, DateEntry[]>();

  // Sort dates by date descending first
  const sortedDates = [...dates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const dateEntry of sortedDates) {
    const key = getMonthKey(new Date(dateEntry.date));
    const existing = groups.get(key) || [];
    existing.push(dateEntry);
    groups.set(key, existing);
  }

  return groups;
};

/**
 * Check if two dates are on the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get traits that were confirmed on a specific date
 */
export const getTraitsConfirmedOnDate = (
  traits: Trait[],
  date: Date
): Trait[] => {
  return traits.filter((trait) => {
    if (!trait.confirmedAt || trait.state !== 'yes') return false;
    return isSameDay(new Date(trait.confirmedAt), new Date(date));
  });
};

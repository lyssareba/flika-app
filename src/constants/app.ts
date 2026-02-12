// Security & Authentication
export const PIN_LENGTH = 4;
export const MIN_PASSWORD_LENGTH = 6;

// Lock Settings
export const DEFAULT_LOCK_TIMEOUT = 10; // minutes
export const LOCK_TIMEOUT_OPTIONS = [1, 5, 10, 15] as const; // minutes

// Attributes
export const MIN_ATTRIBUTES = 3;
export const SUGGESTION_COUNT = 5;

// Swipe Interaction
export const SWIPE_THRESHOLD = 80; // pixels to trigger state change
export const SWIPE_MAX_RATIO = 0.4; // max swipe as ratio of screen width

// Firebase
export const FIRESTORE_BATCH_LIMIT = 499;

// Archive Retention
export const ARCHIVE_RETENTION_MONTHS = 12;
export const ARCHIVE_WARNING_MONTHS = 11;

// Prompts
export const DATE_REMINDER_DAYS = 12;
export const DEALBREAKER_CHECK_MIN_DATES = 4;
export const DEALBREAKER_CHECK_MIN_UNKNOWN = 3;
export const GENERAL_TIP_MAX_DAYS = 30;
export const GENERAL_TIP_COUNT = 5;
export const PROMPT_REDISMISS_DAYS = 7;

// UI
export const NOTES_PREVIEW_MAX_LENGTH = 60;

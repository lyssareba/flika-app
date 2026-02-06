/**
 * Centralized query key factory for TanStack Query.
 * Ensures consistent cache key management across the app.
 */
export const queryKeys = {
  // Prospects
  prospects: {
    all: ['prospects'] as const,
    list: () => [...queryKeys.prospects.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.prospects.all, 'detail', id] as const,
  },

  // Attributes
  attributes: {
    all: ['attributes'] as const,
    list: () => [...queryKeys.attributes.all, 'list'] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: (uid: string) => [...queryKeys.user.all, 'profile', uid] as const,
  },

  // Date entries (for future use)
  dates: {
    all: ['dates'] as const,
    byProspect: (prospectId: string) => [...queryKeys.dates.all, prospectId] as const,
  },
};

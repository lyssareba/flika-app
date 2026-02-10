import { useMemo } from 'react';
import { useProspectsContext } from '@/context/ProspectsContext';
import type { ProspectStatus } from '@/types';
import type { ProspectListData } from '@/services/firebase/firestore';

interface UseProspectsOptions {
  /** Filter by status(es) */
  status?: ProspectStatus | ProspectStatus[];
  /** Search by name */
  searchQuery?: string;
}

interface UseProspectsReturn {
  /** Filtered prospects list */
  prospects: ProspectListData[];
  /** All prospects (unfiltered) */
  allProspects: ProspectListData[];
  /** Active prospects (talking, dating, relationship) */
  activeProspects: ProspectListData[];
  /** Archived prospects */
  archivedProspects: ProspectListData[];
  /** Loading state */
  isLoading: boolean;
  /** Add a new prospect */
  addProspect: ReturnType<typeof useProspectsContext>['addProspect'];
  /** Update prospect info */
  updateProspectInfo: ReturnType<typeof useProspectsContext>['updateProspectInfo'];
  /** Update prospect status */
  updateProspectStatus: ReturnType<typeof useProspectsContext>['updateProspectStatus'];
  /** Archive a prospect */
  archive: ReturnType<typeof useProspectsContext>['archive'];
  /** Archive all other prospects (set target to relationship) */
  archiveOthers: ReturnType<typeof useProspectsContext>['archiveOthers'];
  /** Restore a prospect */
  restore: ReturnType<typeof useProspectsContext>['restore'];
  /** Delete a prospect */
  remove: ReturnType<typeof useProspectsContext>['remove'];
  /** Get full prospect details */
  getProspectDetails: ReturnType<typeof useProspectsContext>['getProspectDetails'];
  /** Refresh prospects */
  refreshProspects: ReturnType<typeof useProspectsContext>['refreshProspects'];
}

/**
 * Hook for accessing and filtering prospects.
 *
 * @example
 * // Get all prospects
 * const { prospects } = useProspects();
 *
 * @example
 * // Get only active prospects
 * const { activeProspects } = useProspects();
 *
 * @example
 * // Filter by specific status
 * const { prospects } = useProspects({ status: 'dating' });
 *
 * @example
 * // Filter by multiple statuses
 * const { prospects } = useProspects({ status: ['talking', 'dating'] });
 *
 * @example
 * // Search by name
 * const { prospects } = useProspects({ searchQuery: 'John' });
 */
export const useProspects = (options: UseProspectsOptions = {}): UseProspectsReturn => {
  const {
    prospects: allProspects,
    isLoading,
    addProspect,
    updateProspectInfo,
    updateProspectStatus,
    archive,
    archiveOthers,
    restore,
    remove,
    getProspectDetails,
    refreshProspects,
  } = useProspectsContext();

  const { status, searchQuery } = options;

  // Pre-computed filtered lists
  const activeProspects = useMemo(
    () =>
      allProspects.filter((p) =>
        ['talking', 'dating', 'relationship'].includes(p.status)
      ),
    [allProspects]
  );

  const archivedProspects = useMemo(
    () => allProspects.filter((p) => p.status === 'archived'),
    [allProspects]
  );

  // Custom filtered list based on options
  const prospects = useMemo(() => {
    let filtered = allProspects;

    // Filter by status
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      filtered = filtered.filter((p) => statuses.includes(p.status));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [allProspects, status, searchQuery]);

  return {
    prospects,
    allProspects,
    activeProspects,
    archivedProspects,
    isLoading,
    addProspect,
    updateProspectInfo,
    updateProspectStatus,
    archive,
    archiveOthers,
    restore,
    remove,
    getProspectDetails,
    refreshProspects,
  };
};

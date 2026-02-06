import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useProspectsListQuery, useProspectMutations } from '@/hooks';
import { type ProspectListData } from '@/services/firebase/firestore';
import type { Prospect, ProspectInput, ProspectStatus } from '@/types';

interface ProspectsContextType {
  /** All prospects (without traits/dates for performance) */
  prospects: ProspectListData[];
  /** Loading state */
  isLoading: boolean;
  /** Add a new prospect */
  addProspect: (input: ProspectInput) => Promise<string>;
  /** Update a prospect's basic info */
  updateProspectInfo: (
    prospectId: string,
    updates: Partial<Pick<Prospect, 'name' | 'photoUri' | 'howWeMet' | 'notes'>>
  ) => void;
  /** Update a prospect's status */
  updateProspectStatus: (prospectId: string, status: ProspectStatus) => void;
  /** Archive a prospect */
  archive: (prospectId: string) => void;
  /** Restore an archived prospect */
  restore: (prospectId: string) => void;
  /** Permanently delete a prospect */
  remove: (prospectId: string) => void;
  /** Get a single prospect with full details (traits, dates) - deprecated, use useProspectQuery */
  getProspectDetails: (prospectId: string) => Promise<Prospect | null>;
  /** Refresh prospects list - now handled automatically by TanStack Query */
  refreshProspects: () => void;
}

const ProspectsContext = createContext<ProspectsContextType | undefined>(undefined);

export const ProspectsProvider = ({ children }: { children: React.ReactNode }) => {
  // Use TanStack Query for data fetching
  const { data: prospects = [], isLoading } = useProspectsListQuery();

  // Use TanStack Query mutations
  const {
    createProspect,
    updateProspectInfo: updateInfo,
    updateProspectStatus: updateStatus,
    archive: archiveProspect,
    restore: restoreProspect,
    remove: removeProspect,
  } = useProspectMutations();

  // Wrapper for addProspect that matches the old interface
  const addProspect = useCallback(
    async (input: ProspectInput): Promise<string> => {
      return createProspect(input);
    },
    [createProspect]
  );

  // Wrapper for updateProspectInfo
  const updateProspectInfo = useCallback(
    (
      prospectId: string,
      updates: Partial<Pick<Prospect, 'name' | 'photoUri' | 'howWeMet' | 'notes'>>
    ) => {
      updateInfo({ prospectId, updates });
    },
    [updateInfo]
  );

  // Wrapper for updateProspectStatus
  const updateProspectStatus = useCallback(
    (prospectId: string, status: ProspectStatus) => {
      updateStatus({ prospectId, status });
    },
    [updateStatus]
  );

  // Deprecated: Use useProspectQuery instead
  const getProspectDetails = useCallback(
    async (_prospectId: string): Promise<Prospect | null> => {
      console.warn('getProspectDetails is deprecated. Use useProspectQuery hook instead.');
      return null;
    },
    []
  );

  // No-op: TanStack Query handles refetching automatically via real-time subscription
  const refreshProspects = useCallback(() => {
    // Real-time subscription handles updates automatically
  }, []);

  const value = useMemo(
    () => ({
      prospects,
      isLoading,
      addProspect,
      updateProspectInfo,
      updateProspectStatus,
      archive: archiveProspect,
      restore: restoreProspect,
      remove: removeProspect,
      getProspectDetails,
      refreshProspects,
    }),
    [
      prospects,
      isLoading,
      addProspect,
      updateProspectInfo,
      updateProspectStatus,
      archiveProspect,
      restoreProspect,
      removeProspect,
      getProspectDetails,
      refreshProspects,
    ]
  );

  return (
    <ProspectsContext.Provider value={value}>{children}</ProspectsContext.Provider>
  );
};

export const useProspectsContext = () => {
  const context = useContext(ProspectsContext);
  if (!context) {
    throw new Error('useProspectsContext must be used within ProspectsProvider');
  }
  return context;
};

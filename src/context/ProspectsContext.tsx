import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuthContext } from './AuthContext';
import { useAttributesContext } from './AttributesContext';
import {
  subscribeToProspects,
  createProspect,
  updateProspect,
  archiveProspect,
  restoreProspect,
  deleteProspect,
  getProspect,
  type ProspectListData,
} from '@/services/firebase/firestore';
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
  ) => Promise<void>;
  /** Update a prospect's status */
  updateProspectStatus: (prospectId: string, status: ProspectStatus) => Promise<void>;
  /** Archive a prospect */
  archive: (prospectId: string) => Promise<void>;
  /** Restore an archived prospect */
  restore: (prospectId: string) => Promise<void>;
  /** Permanently delete a prospect */
  remove: (prospectId: string) => Promise<void>;
  /** Get a single prospect with full details (traits, dates) */
  getProspectDetails: (prospectId: string) => Promise<Prospect | null>;
  /** Refresh prospects list */
  refreshProspects: () => void;
}

const ProspectsContext = createContext<ProspectsContextType | undefined>(undefined);

export const ProspectsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const { attributes } = useAttributesContext();
  const [prospects, setProspects] = useState<ProspectListData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) {
      setProspects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToProspects(
      user.uid,
      (data) => {
        setProspects(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error subscribing to prospects:', error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, refreshKey]);

  const addProspect = useCallback(
    async (input: ProspectInput): Promise<string> => {
      if (!user) throw new Error('User not authenticated');
      return createProspect(user.uid, input, attributes);
    },
    [user, attributes]
  );

  const updateProspectInfo = useCallback(
    async (
      prospectId: string,
      updates: Partial<Pick<Prospect, 'name' | 'photoUri' | 'howWeMet' | 'notes'>>
    ): Promise<void> => {
      if (!user) throw new Error('User not authenticated');
      await updateProspect(user.uid, prospectId, updates);
    },
    [user]
  );

  const updateProspectStatus = useCallback(
    async (prospectId: string, status: ProspectStatus): Promise<void> => {
      if (!user) throw new Error('User not authenticated');
      if (status === 'archived') {
        await archiveProspect(user.uid, prospectId);
      } else {
        await updateProspect(user.uid, prospectId, { status });
      }
    },
    [user]
  );

  const archive = useCallback(
    async (prospectId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');
      await archiveProspect(user.uid, prospectId);
    },
    [user]
  );

  const restore = useCallback(
    async (prospectId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');
      await restoreProspect(user.uid, prospectId);
    },
    [user]
  );

  const remove = useCallback(
    async (prospectId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');
      await deleteProspect(user.uid, prospectId);
    },
    [user]
  );

  const getProspectDetails = useCallback(
    async (prospectId: string): Promise<Prospect | null> => {
      if (!user) return null;
      return getProspect(user.uid, prospectId);
    },
    [user]
  );

  const refreshProspects = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({
      prospects,
      isLoading,
      addProspect,
      updateProspectInfo,
      updateProspectStatus,
      archive,
      restore,
      remove,
      getProspectDetails,
      refreshProspects,
    }),
    [
      prospects,
      isLoading,
      addProspect,
      updateProspectInfo,
      updateProspectStatus,
      archive,
      restore,
      remove,
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

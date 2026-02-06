import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import i18n from 'i18next';
import {
  createProspect,
  updateProspect,
  archiveProspect,
  restoreProspect,
  deleteProspect,
  type ProspectListData,
} from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { useAttributes } from './useAttributes';
import { queryKeys } from './queryKeys';
import type { Prospect, ProspectInput, ProspectStatus } from '@/types';

/**
 * Hook for prospect mutations with optimistic updates and error handling.
 */
export const useProspectMutations = () => {
  const { user } = useAuth();
  const { attributes } = useAttributes();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (input: ProspectInput) => {
      if (!user) throw new Error('User not authenticated');
      return createProspect(user.uid, input, attributes);
    },
    onSuccess: () => {
      // Invalidate prospects list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.list() });
    },
    onError: (error) => {
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not create prospect. Please try again.')
      );
      console.error('Create prospect error:', error);
    },
  });

  const updateInfoMutation = useMutation({
    mutationFn: async ({
      prospectId,
      updates,
    }: {
      prospectId: string;
      updates: Partial<Pick<Prospect, 'name' | 'photoUri' | 'howWeMet' | 'notes'>>;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await updateProspect(user.uid, prospectId, updates);
      return { prospectId, updates };
    },
    onMutate: async ({ prospectId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.prospects.list() });

      // Snapshot previous value
      const previousList = queryClient.getQueryData<ProspectListData[]>(
        queryKeys.prospects.list()
      );

      // Optimistically update the list
      if (previousList) {
        queryClient.setQueryData<ProspectListData[]>(
          queryKeys.prospects.list(),
          previousList.map((p) =>
            p.id === prospectId ? { ...p, ...updates, updatedAt: new Date() } : p
          )
        );
      }

      return { previousList };
    },
    onError: (error, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.prospects.list(), context.previousList);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not update prospect. Please try again.')
      );
      console.error('Update prospect error:', error);
    },
    onSettled: (_data, _error, { prospectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.detail(prospectId) });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      prospectId,
      status,
    }: {
      prospectId: string;
      status: ProspectStatus;
    }) => {
      if (!user) throw new Error('User not authenticated');
      if (status === 'archived') {
        await archiveProspect(user.uid, prospectId);
      } else {
        await updateProspect(user.uid, prospectId, { status });
      }
      return { prospectId, status };
    },
    onMutate: async ({ prospectId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.prospects.list() });

      const previousList = queryClient.getQueryData<ProspectListData[]>(
        queryKeys.prospects.list()
      );

      if (previousList) {
        queryClient.setQueryData<ProspectListData[]>(
          queryKeys.prospects.list(),
          previousList.map((p) =>
            p.id === prospectId
              ? {
                  ...p,
                  status,
                  previousStatus: status === 'archived' ? p.status : undefined,
                  archivedAt: status === 'archived' ? new Date() : undefined,
                  updatedAt: new Date(),
                }
              : p
          )
        );
      }

      return { previousList };
    },
    onError: (error, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.prospects.list(), context.previousList);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not update status. Please try again.')
      );
      console.error('Update status error:', error);
    },
    onSettled: (_data, _error, { prospectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.detail(prospectId) });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (prospectId: string) => {
      if (!user) throw new Error('User not authenticated');
      await archiveProspect(user.uid, prospectId);
      return prospectId;
    },
    onMutate: async (prospectId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.prospects.list() });

      const previousList = queryClient.getQueryData<ProspectListData[]>(
        queryKeys.prospects.list()
      );

      if (previousList) {
        queryClient.setQueryData<ProspectListData[]>(
          queryKeys.prospects.list(),
          previousList.map((p) =>
            p.id === prospectId
              ? {
                  ...p,
                  status: 'archived' as const,
                  previousStatus: p.status,
                  archivedAt: new Date(),
                  updatedAt: new Date(),
                }
              : p
          )
        );
      }

      return { previousList };
    },
    onError: (error, _prospectId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.prospects.list(), context.previousList);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not archive prospect. Please try again.')
      );
      console.error('Archive prospect error:', error);
    },
    onSettled: (prospectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.list() });
      if (prospectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.prospects.detail(prospectId) });
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (prospectId: string) => {
      if (!user) throw new Error('User not authenticated');
      await restoreProspect(user.uid, prospectId);
      return prospectId;
    },
    onMutate: async (prospectId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.prospects.list() });

      const previousList = queryClient.getQueryData<ProspectListData[]>(
        queryKeys.prospects.list()
      );

      if (previousList) {
        const prospect = previousList.find((p) => p.id === prospectId);
        const restoredStatus = prospect?.previousStatus || 'dating';

        queryClient.setQueryData<ProspectListData[]>(
          queryKeys.prospects.list(),
          previousList.map((p) =>
            p.id === prospectId
              ? {
                  ...p,
                  status: restoredStatus,
                  previousStatus: undefined,
                  archivedAt: undefined,
                  updatedAt: new Date(),
                }
              : p
          )
        );
      }

      return { previousList };
    },
    onError: (error, _prospectId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.prospects.list(), context.previousList);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not restore prospect. Please try again.')
      );
      console.error('Restore prospect error:', error);
    },
    onSettled: (prospectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.list() });
      if (prospectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.prospects.detail(prospectId) });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (prospectId: string) => {
      if (!user) throw new Error('User not authenticated');
      await deleteProspect(user.uid, prospectId);
      return prospectId;
    },
    onMutate: async (prospectId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.prospects.list() });

      const previousList = queryClient.getQueryData<ProspectListData[]>(
        queryKeys.prospects.list()
      );

      if (previousList) {
        queryClient.setQueryData<ProspectListData[]>(
          queryKeys.prospects.list(),
          previousList.filter((p) => p.id !== prospectId)
        );
      }

      return { previousList };
    },
    onError: (error, _prospectId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.prospects.list(), context.previousList);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not delete prospect. Please try again.')
      );
      console.error('Delete prospect error:', error);
    },
    onSettled: (prospectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.list() });
      if (prospectId) {
        queryClient.removeQueries({ queryKey: queryKeys.prospects.detail(prospectId) });
      }
    },
  });

  return {
    createProspect: createMutation.mutateAsync,
    updateProspectInfo: updateInfoMutation.mutate,
    updateProspectStatus: updateStatusMutation.mutate,
    archive: archiveMutation.mutate,
    restore: restoreMutation.mutate,
    remove: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateInfoMutation.isPending || updateStatusMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

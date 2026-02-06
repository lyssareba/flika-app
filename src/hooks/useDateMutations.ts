import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import i18n from 'i18next';
import {
  addDateEntry,
  updateDateEntry,
  deleteDateEntry,
} from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';
import type { DateEntry } from '@/types';

/**
 * Hook for date entry mutations with cache invalidation and error handling.
 */
export const useDateMutations = (prospectId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (entry: Omit<DateEntry, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('User not authenticated');
      return addDateEntry(user.uid, prospectId, entry);
    },
    onSuccess: () => {
      // Invalidate prospect detail to refetch with new date
      queryClient.invalidateQueries({
        queryKey: queryKeys.prospects.detail(prospectId),
      });
      // Also invalidate list since adding first date may change status
      queryClient.invalidateQueries({
        queryKey: queryKeys.prospects.list(),
      });
    },
    onError: (error) => {
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not add date. Please try again.')
      );
      console.error('Add date error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      dateId,
      updates,
    }: {
      dateId: string;
      updates: Partial<Omit<DateEntry, 'id' | 'createdAt'>>;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await updateDateEntry(user.uid, prospectId, dateId, updates);
      return { dateId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prospects.detail(prospectId),
      });
    },
    onError: (error) => {
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not update date. Please try again.')
      );
      console.error('Update date error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (dateId: string) => {
      if (!user) throw new Error('User not authenticated');
      await deleteDateEntry(user.uid, prospectId, dateId);
      return dateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prospects.detail(prospectId),
      });
    },
    onError: (error) => {
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not delete date. Please try again.')
      );
      console.error('Delete date error:', error);
    },
  });

  return {
    addDate: addMutation.mutateAsync,
    updateDate: updateMutation.mutateAsync,
    deleteDate: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

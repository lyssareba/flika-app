import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import i18n from 'i18next';
import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addTraitToAllProspects,
  removeTraitFromAllProspects,
} from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { queryKeys } from './queryKeys';
import type { Attribute, AttributeCategory, AttributeInput } from '@/types';

/**
 * Hook for attribute mutations with optimistic updates and error handling.
 */
export const useAttributeMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      category,
    }: {
      name: string;
      category: AttributeCategory;
    }) => {
      if (!user) throw new Error('User not authenticated');
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error('Name is required');

      const input: AttributeInput = { name: trimmedName, category };
      const id = await createAttribute(user.uid, input);
      await addTraitToAllProspects(user.uid, id);
      return { id, name: trimmedName, category };
    },
    onMutate: async ({ name, category }) => {
      const trimmedName = name.trim();
      await queryClient.cancelQueries({ queryKey: queryKeys.attributes.list() });

      const previousAttributes = queryClient.getQueryData<Attribute[]>(
        queryKeys.attributes.list()
      );

      // Check for duplicates - skip optimistic update if duplicate
      if (previousAttributes?.some((a) => a.name.toLowerCase() === trimmedName.toLowerCase())) {
        return { previousAttributes };
      }

      // Optimistically add the attribute
      if (previousAttributes) {
        const optimisticAttribute: Attribute = {
          id: `temp-${Date.now()}`,
          name: trimmedName,
          category,
          createdAt: new Date(),
          order: Date.now(),
        };
        queryClient.setQueryData<Attribute[]>(
          queryKeys.attributes.list(),
          [...previousAttributes, optimisticAttribute]
        );
      }

      return { previousAttributes };
    },
    onError: (error, _variables, context) => {
      if (context?.previousAttributes) {
        queryClient.setQueryData(queryKeys.attributes.list(), context.previousAttributes);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not add attribute. Please try again.')
      );
      console.error('Create attribute error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.all });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      attributeId,
      category,
    }: {
      attributeId: string;
      category: AttributeCategory;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await updateAttribute(user.uid, attributeId, { category });
      return { attributeId, category };
    },
    onMutate: async ({ attributeId, category }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attributes.list() });

      const previousAttributes = queryClient.getQueryData<Attribute[]>(
        queryKeys.attributes.list()
      );

      if (previousAttributes) {
        queryClient.setQueryData<Attribute[]>(
          queryKeys.attributes.list(),
          previousAttributes.map((a) =>
            a.id === attributeId ? { ...a, category } : a
          )
        );
      }

      return { previousAttributes };
    },
    onError: (error, _variables, context) => {
      if (context?.previousAttributes) {
        queryClient.setQueryData(queryKeys.attributes.list(), context.previousAttributes);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not update attribute. Please try again.')
      );
      console.error('Update attribute error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.all });
    },
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: async (attributeId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get current category from cache
      const attributes = queryClient.getQueryData<Attribute[]>(
        queryKeys.attributes.list()
      );
      const attribute = attributes?.find((a) => a.id === attributeId);
      if (!attribute) throw new Error('Attribute not found');

      const newCategory: AttributeCategory =
        attribute.category === 'dealbreaker' ? 'desired' : 'dealbreaker';
      await updateAttribute(user.uid, attributeId, { category: newCategory });
      return { attributeId, newCategory };
    },
    onMutate: async (attributeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attributes.list() });

      const previousAttributes = queryClient.getQueryData<Attribute[]>(
        queryKeys.attributes.list()
      );

      if (previousAttributes) {
        queryClient.setQueryData<Attribute[]>(
          queryKeys.attributes.list(),
          previousAttributes.map((a) =>
            a.id === attributeId
              ? { ...a, category: a.category === 'dealbreaker' ? 'desired' : 'dealbreaker' }
              : a
          )
        );
      }

      return { previousAttributes };
    },
    onError: (error, _attributeId, context) => {
      if (context?.previousAttributes) {
        queryClient.setQueryData(queryKeys.attributes.list(), context.previousAttributes);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not update attribute. Please try again.')
      );
      console.error('Toggle category error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.all });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      attributeId,
      newOrder,
    }: {
      attributeId: string;
      newOrder: number;
    }) => {
      if (!user) throw new Error('User not authenticated');
      await updateAttribute(user.uid, attributeId, { order: newOrder });
      return { attributeId, newOrder };
    },
    onMutate: async ({ attributeId, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attributes.list() });

      const previousAttributes = queryClient.getQueryData<Attribute[]>(
        queryKeys.attributes.list()
      );

      if (previousAttributes) {
        const updated = previousAttributes.map((a) =>
          a.id === attributeId ? { ...a, order: newOrder } : a
        );
        updated.sort((a, b) => a.order - b.order);
        queryClient.setQueryData<Attribute[]>(queryKeys.attributes.list(), updated);
      }

      return { previousAttributes };
    },
    onError: (error, _variables, context) => {
      if (context?.previousAttributes) {
        queryClient.setQueryData(queryKeys.attributes.list(), context.previousAttributes);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not reorder attribute. Please try again.')
      );
      console.error('Reorder attribute error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.list() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attributeId: string) => {
      if (!user) throw new Error('User not authenticated');
      await removeTraitFromAllProspects(user.uid, attributeId);
      await deleteAttribute(user.uid, attributeId);
      return attributeId;
    },
    onMutate: async (attributeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attributes.list() });

      const previousAttributes = queryClient.getQueryData<Attribute[]>(
        queryKeys.attributes.list()
      );

      if (previousAttributes) {
        queryClient.setQueryData<Attribute[]>(
          queryKeys.attributes.list(),
          previousAttributes.filter((a) => a.id !== attributeId)
        );
      }

      return { previousAttributes };
    },
    onError: (error, _attributeId, context) => {
      if (context?.previousAttributes) {
        queryClient.setQueryData(queryKeys.attributes.list(), context.previousAttributes);
      }
      Alert.alert(
        i18n.t('common:Error'),
        i18n.t('common:Could not delete attribute. Please try again.')
      );
      console.error('Delete attribute error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prospects.all });
    },
  });

  return {
    addAttribute: createMutation.mutate,
    toggleCategory: toggleCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    reorderAttribute: reorderMutation.mutate,
    removeAttribute: deleteMutation.mutate,
    isAdding: createMutation.isPending,
    isUpdating: updateCategoryMutation.isPending || toggleCategoryMutation.isPending,
    isReordering: reorderMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

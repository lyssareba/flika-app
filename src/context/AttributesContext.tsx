import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from './AuthContext';
import { useAttributesQuery, useAttributeMutations, queryKeys } from '@/hooks';
import type { Attribute, AttributeCategory } from '@/types';
import { getRandomPresets } from '@/constants/translations/presetAttributes';
import { MIN_ATTRIBUTES, SUGGESTION_COUNT } from '@/constants';

interface AttributesContextType {
  attributes: Attribute[];
  isLoading: boolean;
  addAttribute: (name: string, category: AttributeCategory) => Promise<void>;
  addAttributeFromSuggestion: (name: string, category: AttributeCategory) => Promise<void>;
  removeAttribute: (attributeId: string) => Promise<void>;
  toggleCategory: (attributeId: string) => Promise<void>;
  reorderAttribute: (attributeId: string, newOrder: number) => Promise<void>;
  refreshAttributes: () => Promise<void>;
  suggestions: string[];
  refreshSuggestions: () => void;
  hasMinimumAttributes: boolean;
}

const AttributesContext = createContext<AttributesContextType | undefined>(undefined);

export const AttributesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Use TanStack Query for attributes data
  const { data: attributes = [], isLoading } = useAttributesQuery();

  // Use TanStack Query mutations
  const {
    addAttribute: addAttributeMutation,
    toggleCategory: toggleCategoryMutation,
    reorderAttribute: reorderMutation,
    removeAttribute: removeMutation,
  } = useAttributeMutations();

  // Suggestions state (not stored in query cache - local UI state)
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const shownPresets = useRef<Set<string>>(new Set());
  const addingNames = useRef<Set<string>>(new Set());

  const hasMinimumAttributes = attributes.length >= MIN_ATTRIBUTES;

  // Generate suggestions excluding already-added attributes and previously shown
  const refreshSuggestions = useCallback(() => {
    const addedNames = attributes.map((a) => a.name.toLowerCase());
    const exclude = [...addedNames, ...Array.from(shownPresets.current)];
    let newSuggestions = getRandomPresets(SUGGESTION_COUNT, exclude);

    // If we've exhausted all presets, reset shown tracking (but still exclude added)
    if (newSuggestions.length === 0) {
      shownPresets.current = new Set();
      newSuggestions = getRandomPresets(SUGGESTION_COUNT, addedNames);
    }

    newSuggestions.forEach((s) => shownPresets.current.add(s));
    setSuggestions(newSuggestions);
  }, [attributes]);

  // Replace a single used suggestion with a new one
  const replaceSuggestion = useCallback(
    (usedSuggestion: string) => {
      setSuggestions((prev) => {
        const index = prev.indexOf(usedSuggestion);
        if (index === -1) return prev;

        // Build exclusion list: added attributes + shown presets + current suggestions
        const addedNames = attributes.map((a) => a.name.toLowerCase());
        const currentSuggestions = prev.map((s) => s.toLowerCase());
        const exclude = [
          ...addedNames,
          ...Array.from(shownPresets.current),
          ...currentSuggestions,
        ];

        const [replacement] = getRandomPresets(1, exclude);

        if (replacement) {
          shownPresets.current.add(replacement);
          const updated = [...prev];
          updated[index] = replacement;
          return updated;
        }

        // No replacement available — just remove the used suggestion
        return prev.filter((_, i) => i !== index);
      });
    },
    [attributes]
  );

  // Initialize suggestions once after initial load
  useEffect(() => {
    if (!isLoading && attributes.length >= 0) {
      refreshSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const addAttribute = useCallback(
    async (name: string, category: AttributeCategory) => {
      if (!user) return;

      const trimmedName = name.trim();
      if (!trimmedName) return;

      const lowerName = trimmedName.toLowerCase();

      // Guard against concurrent duplicate adds
      if (addingNames.current.has(lowerName)) return;

      // Check existing attributes for duplicates
      if (attributes.some((a) => a.name.toLowerCase() === lowerName)) return;

      addingNames.current.add(lowerName);

      try {
        addAttributeMutation({ name: trimmedName, category });
      } finally {
        addingNames.current.delete(lowerName);
      }
    },
    [user, attributes, addAttributeMutation]
  );

  const addAttributeFromSuggestion = useCallback(
    async (name: string, category: AttributeCategory) => {
      await addAttribute(name, category);
      replaceSuggestion(name);
    },
    [addAttribute, replaceSuggestion]
  );

  const removeAttribute = useCallback(
    async (attributeId: string) => {
      removeMutation(attributeId);
    },
    [removeMutation]
  );

  const toggleCategory = useCallback(
    async (attributeId: string) => {
      toggleCategoryMutation(attributeId);
    },
    [toggleCategoryMutation]
  );

  const reorderAttribute = useCallback(
    async (attributeId: string, newOrder: number) => {
      reorderMutation({ attributeId, newOrder });
    },
    [reorderMutation]
  );

  const refreshAttributes = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.attributes.list() });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      attributes,
      isLoading,
      addAttribute,
      addAttributeFromSuggestion,
      removeAttribute,
      toggleCategory,
      reorderAttribute,
      refreshAttributes,
      suggestions,
      refreshSuggestions,
      hasMinimumAttributes,
    }),
    [
      attributes,
      isLoading,
      addAttribute,
      addAttributeFromSuggestion,
      removeAttribute,
      toggleCategory,
      reorderAttribute,
      refreshAttributes,
      suggestions,
      refreshSuggestions,
      hasMinimumAttributes,
    ]
  );

  return (
    <AttributesContext.Provider value={value}>
      {children}
    </AttributesContext.Provider>
  );
};

export const useAttributesContext = () => {
  const context = useContext(AttributesContext);
  if (!context) {
    throw new Error('useAttributesContext must be used within AttributesProvider');
  }
  return context;
};

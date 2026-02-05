import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useAuthContext } from './AuthContext';
import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from '@/services/firebase/firestore';
import type { Attribute, AttributeCategory, AttributeInput } from '@/types';
import { getRandomPresets } from '@/constants/translations/presetAttributes';

interface AttributesContextType {
  attributes: Attribute[];
  isLoading: boolean;
  addAttribute: (name: string, category: AttributeCategory) => Promise<void>;
  removeAttribute: (attributeId: string) => Promise<void>;
  toggleCategory: (attributeId: string) => Promise<void>;
  reorderAttribute: (attributeId: string, newOrder: number) => Promise<void>;
  refreshAttributes: () => Promise<void>;
  // Preset suggestions
  suggestions: string[];
  refreshSuggestions: () => void;
  // Validation
  hasMinimumAttributes: boolean;
}

const MIN_ATTRIBUTES = 3;
const SUGGESTION_COUNT = 5;

const AttributesContext = createContext<AttributesContextType | undefined>(undefined);

export const AttributesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const shownPresets = useRef<Set<string>>(new Set());

  const hasMinimumAttributes = attributes.length >= MIN_ATTRIBUTES;

  // Generate suggestions excluding already-added attributes and previously shown
  const refreshSuggestions = useCallback(() => {
    const addedNames = attributes.map((a) => a.name);
    const exclude = [...addedNames, ...shownPresets.current];
    let newSuggestions = getRandomPresets(SUGGESTION_COUNT, exclude);

    // If we've exhausted all presets, reset shown tracking (but still exclude added)
    if (newSuggestions.length === 0) {
      shownPresets.current = new Set();
      newSuggestions = getRandomPresets(SUGGESTION_COUNT, addedNames);
    }

    // Track these as shown
    newSuggestions.forEach((s) => shownPresets.current.add(s));
    setSuggestions(newSuggestions);
  }, [attributes]);

  // Fetch attributes from Firestore
  const fetchAttributes = useCallback(async () => {
    if (!user) {
      setAttributes([]);
      setIsLoading(false);
      return;
    }

    try {
      const attrs = await getAttributes(user.uid);
      setAttributes(attrs);
    } catch {
      // Keep existing state on error
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load on mount and when user changes
  useEffect(() => {
    setIsLoading(true);
    fetchAttributes();
  }, [fetchAttributes]);

  // Initialize suggestions when attributes load
  useEffect(() => {
    if (!isLoading) {
      refreshSuggestions();
    }
  }, [isLoading, refreshSuggestions]);

  const addAttribute = useCallback(
    async (name: string, category: AttributeCategory) => {
      if (!user) return;

      const trimmedName = name.trim();
      if (!trimmedName) return;

      // Prevent duplicates (case-insensitive)
      const isDuplicate = attributes.some(
        (a) => a.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) return;

      const input: AttributeInput = {
        name: trimmedName,
        category,
      };

      const id = await createAttribute(user.uid, input);

      // Optimistic update
      const newAttribute: Attribute = {
        id,
        name: trimmedName,
        category,
        createdAt: new Date(),
        order: Date.now(),
      };
      setAttributes((prev) => [...prev, newAttribute]);
    },
    [user, attributes]
  );

  const removeAttribute = useCallback(
    async (attributeId: string) => {
      if (!user) return;

      await deleteAttribute(user.uid, attributeId);
      setAttributes((prev) => prev.filter((a) => a.id !== attributeId));
    },
    [user]
  );

  const toggleCategory = useCallback(
    async (attributeId: string) => {
      if (!user) return;

      const attr = attributes.find((a) => a.id === attributeId);
      if (!attr) return;

      const newCategory: AttributeCategory =
        attr.category === 'dealbreaker' ? 'desired' : 'dealbreaker';

      await updateAttribute(user.uid, attributeId, { category: newCategory });

      // Optimistic update
      setAttributes((prev) =>
        prev.map((a) =>
          a.id === attributeId ? { ...a, category: newCategory } : a
        )
      );
    },
    [user, attributes]
  );

  const reorderAttribute = useCallback(
    async (attributeId: string, newOrder: number) => {
      if (!user) return;

      await updateAttribute(user.uid, attributeId, { order: newOrder });

      // Optimistic update
      setAttributes((prev) =>
        [...prev.map((a) =>
          a.id === attributeId ? { ...a, order: newOrder } : a
        )].sort((a, b) => a.order - b.order)
      );
    },
    [user]
  );

  const value = useMemo(
    () => ({
      attributes,
      isLoading,
      addAttribute,
      removeAttribute,
      toggleCategory,
      reorderAttribute,
      refreshAttributes: fetchAttributes,
      suggestions,
      refreshSuggestions,
      hasMinimumAttributes,
    }),
    [
      attributes,
      isLoading,
      addAttribute,
      removeAttribute,
      toggleCategory,
      reorderAttribute,
      fetchAttributes,
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

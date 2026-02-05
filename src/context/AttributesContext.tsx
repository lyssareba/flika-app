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
  suggestions: string[];
  refreshSuggestions: () => void;
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

  // Initialize suggestions once after initial load
  useEffect(() => {
    if (!isLoading) {
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

      // Guard against concurrent duplicate adds using ref
      if (addingNames.current.has(lowerName)) return;

      // Check existing attributes for duplicates (case-insensitive)
      let isDuplicate = false;
      setAttributes((prev) => {
        isDuplicate = prev.some((a) => a.name.toLowerCase() === lowerName);
        return prev;
      });
      if (isDuplicate) return;

      addingNames.current.add(lowerName);

      try {
        const order = Date.now();
        const input: AttributeInput = { name: trimmedName, category };
        const id = await createAttribute(user.uid, input);

        setAttributes((prev) => {
          // Final duplicate check against latest state
          if (prev.some((a) => a.name.toLowerCase() === lowerName)) {
            return prev;
          }
          return [...prev, {
            id,
            name: trimmedName,
            category,
            createdAt: new Date(),
            order,
          }];
        });
      } finally {
        addingNames.current.delete(lowerName);
      }
    },
    [user]
  );

  const removeAttribute = useCallback(
    async (attributeId: string) => {
      if (!user) return;

      // Optimistic update
      let removed: Attribute | undefined;
      setAttributes((prev) => {
        removed = prev.find((a) => a.id === attributeId);
        return prev.filter((a) => a.id !== attributeId);
      });

      try {
        await deleteAttribute(user.uid, attributeId);
      } catch (error) {
        // Rollback on failure
        if (removed) {
          setAttributes((prev) => [...prev, removed!].sort((a, b) => a.order - b.order));
        }
        throw error;
      }
    },
    [user]
  );

  const toggleCategory = useCallback(
    async (attributeId: string) => {
      if (!user) return;

      // Optimistic update using functional updater to avoid stale closures
      let newCategory: AttributeCategory | undefined;
      setAttributes((prev) =>
        prev.map((a) => {
          if (a.id === attributeId) {
            newCategory = a.category === 'dealbreaker' ? 'desired' : 'dealbreaker';
            return { ...a, category: newCategory };
          }
          return a;
        })
      );

      if (!newCategory) return;

      try {
        await updateAttribute(user.uid, attributeId, { category: newCategory });
      } catch (error) {
        // Rollback: toggle back
        setAttributes((prev) =>
          prev.map((a) => {
            if (a.id === attributeId) {
              const rollbackCategory: AttributeCategory =
                a.category === 'dealbreaker' ? 'desired' : 'dealbreaker';
              return { ...a, category: rollbackCategory };
            }
            return a;
          })
        );
        throw error;
      }
    },
    [user]
  );

  const reorderAttribute = useCallback(
    async (attributeId: string, newOrder: number) => {
      if (!user) return;

      // Optimistic update
      let previousOrder: number | undefined;
      setAttributes((prev) => {
        const attr = prev.find((a) => a.id === attributeId);
        previousOrder = attr?.order;
        return [...prev.map((a) =>
          a.id === attributeId ? { ...a, order: newOrder } : a
        )].sort((a, b) => a.order - b.order);
      });

      try {
        await updateAttribute(user.uid, attributeId, { order: newOrder });
      } catch (error) {
        // Rollback
        if (previousOrder !== undefined) {
          setAttributes((prev) =>
            [...prev.map((a) =>
              a.id === attributeId ? { ...a, order: previousOrder! } : a
            )].sort((a, b) => a.order - b.order)
          );
        }
        throw error;
      }
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

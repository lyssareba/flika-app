import { useAttributesContext } from '@/context/AttributesContext';

/**
 * Convenience hook for accessing attributes state and methods.
 */
export const useAttributes = () => {
  return useAttributesContext();
};

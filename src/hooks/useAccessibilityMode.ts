import { useReduceMotion } from './useReduceMotion';
import { useAuth } from './useAuth';

/**
 * Hook combining user preference + system setting to determine if checkbox mode is active.
 * Checkbox mode is enabled when:
 * - User has explicitly enabled it in settings, OR
 * - System "Reduce Motion" is enabled
 */
export const useAccessibilityMode = () => {
  const reduceMotion = useReduceMotion();
  const { userProfile } = useAuth();

  // User setting OR system reduce motion = checkbox mode
  const useCheckboxView = userProfile?.settings?.useCheckboxView || reduceMotion;

  return { useCheckboxView, reduceMotion };
};

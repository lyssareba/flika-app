import { useState, useEffect, useCallback, useMemo } from 'react';
import type { InAppPrompt , Prospect } from '@/types';
import type { ProspectListData } from '@/services/firebase/firestore';
import { useAuth } from './useAuth';
import { getDismissedPromptKeys, dismissPrompt } from '@/services/storage/asyncStorage';
import { generateHomePrompts, generateProspectPrompts, getGeneralTip } from '@/utils/prompts';
import { PROMPT_REDISMISS_DAYS } from '@/constants';

export const useHomePrompts = (
  prospects: ProspectListData[]
): { prompt: InAppPrompt | null; dismiss: (prompt: InAppPrompt) => void; isLoading: boolean } => {
  const { user, userProfile } = useAuth();
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    getDismissedPromptKeys(user.uid, PROMPT_REDISMISS_DAYS)
      .then(setDismissedKeys)
      .finally(() => setIsLoading(false));
  }, [user]);

  const prompt = useMemo(() => {
    if (isLoading) return null;

    const homePrompts = generateHomePrompts(prospects, dismissedKeys);

    // Add general tip if applicable
    if (userProfile?.createdAt) {
      const daysSinceJoined = Math.floor(
        (Date.now() - userProfile.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const tip = getGeneralTip(daysSinceJoined, dismissedKeys);
      if (tip) homePrompts.push(tip);
    }

    homePrompts.sort((a, b) => a.priority - b.priority);
    return homePrompts[0] ?? null;
  }, [prospects, dismissedKeys, isLoading, userProfile]);

  const dismiss = useCallback(
    (p: InAppPrompt) => {
      if (!user) return;
      setDismissedKeys((prev) => new Set(prev).add(p.dismissalKey));
      dismissPrompt(user.uid, p.dismissalKey).catch(console.error);
    },
    [user]
  );

  return { prompt, dismiss, isLoading };
};

export const useProspectPrompts = (
  prospect: Prospect | null
): { prompts: InAppPrompt[]; dismiss: (prompt: InAppPrompt) => void; isLoading: boolean } => {
  const { user } = useAuth();
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    getDismissedPromptKeys(user.uid, PROMPT_REDISMISS_DAYS)
      .then(setDismissedKeys)
      .finally(() => setIsLoading(false));
  }, [user]);

  const prompts = useMemo(() => {
    if (isLoading || !prospect) return [];
    return generateProspectPrompts(prospect, dismissedKeys);
  }, [prospect, dismissedKeys, isLoading]);

  const dismiss = useCallback(
    (p: InAppPrompt) => {
      if (!user) return;
      setDismissedKeys((prev) => new Set(prev).add(p.dismissalKey));
      dismissPrompt(user.uid, p.dismissalKey).catch(console.error);
    },
    [user]
  );

  return { prompts, dismiss, isLoading };
};

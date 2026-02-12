import type { InAppPrompt , Prospect } from '@/types';
import type { ProspectListData } from '@/services/firebase/firestore';
import {
  DATE_REMINDER_DAYS,
  DEALBREAKER_CHECK_MIN_DATES,
  DEALBREAKER_CHECK_MIN_UNKNOWN,
  GENERAL_TIP_COUNT,
  GENERAL_TIP_MAX_DAYS,
} from '@/constants';

const daysSince = (date: Date): number => {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
};

export const generateHomePrompts = (
  prospects: ProspectListData[],
  dismissedKeys: Set<string>
): InAppPrompt[] => {
  const prompts: InAppPrompt[] = [];

  for (const prospect of prospects) {
    if (!prospect.cachedLastDateAt) continue;
    if (!['talking', 'dating', 'relationship'].includes(prospect.status)) continue;

    const days = daysSince(prospect.cachedLastDateAt);
    if (days < DATE_REMINDER_DAYS) continue;

    const dismissalKey = `date_reminder_${prospect.id}`;
    if (dismissedKeys.has(dismissalKey)) continue;

    prompts.push({
      id: `date_reminder_${prospect.id}`,
      type: 'date_reminder',
      priority: 2,
      prospectId: prospect.id,
      prospectName: prospect.name,
      mascotState: 'curious',
      messageKey: 'prompts:dateReminder',
      messageParams: { name: prospect.name.split(' ')[0] },
      dismissalKey,
    });
  }

  return prompts.sort((a, b) => a.priority - b.priority);
};

export const generateProspectPrompts = (
  prospect: Prospect,
  dismissedKeys: Set<string>
): InAppPrompt[] => {
  const prompts: InAppPrompt[] = [];
  const firstName = prospect.name.split(' ')[0];

  // Date reminder
  if (prospect.dates.length > 0) {
    const mostRecentDate = prospect.dates.reduce((latest, d) =>
      d.date > latest.date ? d : latest
    );
    const days = daysSince(mostRecentDate.date);

    if (days >= DATE_REMINDER_DAYS) {
      const dismissalKey = `date_reminder_${prospect.id}`;
      if (!dismissedKeys.has(dismissalKey)) {
        prompts.push({
          id: `date_reminder_${prospect.id}`,
          type: 'date_reminder',
          priority: 2,
          prospectId: prospect.id,
          prospectName: prospect.name,
          mascotState: 'curious',
          messageKey: 'prompts:dateReminder',
          messageParams: { name: firstName },
          dismissalKey,
        });
      }
    }
  }

  // Dealbreaker check
  if (prospect.dates.length >= DEALBREAKER_CHECK_MIN_DATES) {
    const unknownDealbreakers = prospect.traits.filter(
      (t) => t.attributeCategory === 'dealbreaker' && t.state === 'unknown'
    ).length;

    if (unknownDealbreakers >= DEALBREAKER_CHECK_MIN_UNKNOWN) {
      const dismissalKey = `dealbreaker_check_${prospect.id}`;
      if (!dismissedKeys.has(dismissalKey)) {
        prompts.push({
          id: `dealbreaker_check_${prospect.id}`,
          type: 'dealbreaker_check',
          priority: 1,
          prospectId: prospect.id,
          prospectName: prospect.name,
          mascotState: 'thinking',
          messageKey: 'prompts:dealbreakerCheck',
          messageParams: { count: unknownDealbreakers, name: firstName },
          dismissalKey,
        });
      }
    }
  }

  // Milestone: relationship status
  if (prospect.status === 'relationship') {
    const dismissalKey = `milestone_relationship_${prospect.id}`;
    if (!dismissedKeys.has(dismissalKey)) {
      prompts.push({
        id: `milestone_relationship_${prospect.id}`,
        type: 'milestone',
        priority: 3,
        prospectId: prospect.id,
        prospectName: prospect.name,
        mascotState: 'celebrating',
        messageKey: 'prompts:milestoneRelationship',
        messageParams: { name: firstName },
        dismissalKey,
      });
    }
  }

  // Milestone: all dealbreakers confirmed
  const dealbreakers = prospect.traits.filter((t) => t.attributeCategory === 'dealbreaker');
  if (dealbreakers.length > 0 && dealbreakers.every((t) => t.state !== 'unknown')) {
    const dismissalKey = `milestone_allDealbreakers_${prospect.id}`;
    if (!dismissedKeys.has(dismissalKey)) {
      prompts.push({
        id: `milestone_allDealbreakers_${prospect.id}`,
        type: 'milestone',
        priority: 3,
        prospectId: prospect.id,
        prospectName: prospect.name,
        mascotState: 'happy',
        messageKey: 'prompts:milestoneAllDealbreakers',
        messageParams: { name: firstName },
        dismissalKey,
      });
    }
  }

  return prompts.sort((a, b) => a.priority - b.priority);
};

export const getGeneralTip = (
  daysSinceJoined: number,
  dismissedKeys: Set<string>
): InAppPrompt | null => {
  if (daysSinceJoined > GENERAL_TIP_MAX_DAYS) return null;

  const tipIndex = daysSinceJoined % GENERAL_TIP_COUNT;
  const dismissalKey = `general_tip_${tipIndex}`;

  if (dismissedKeys.has(dismissalKey)) return null;

  return {
    id: `general_tip_${tipIndex}`,
    type: 'general_tip',
    priority: 4,
    mascotState: 'idle',
    messageKey: `prompts:tip${tipIndex}`,
    dismissalKey,
  };
};

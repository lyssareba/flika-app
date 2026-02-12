import { generateHomePrompts, generateProspectPrompts, getGeneralTip } from '../prompts';
import type { Prospect } from '@/types';
import type { ProspectListData } from '@/services/firebase/firestore';
import {
  DATE_REMINDER_DAYS,
  DEALBREAKER_CHECK_MIN_DATES,
  DEALBREAKER_CHECK_MIN_UNKNOWN,
  GENERAL_TIP_MAX_DAYS,
  GENERAL_TIP_COUNT,
} from '@/constants';

const daysAgo = (days: number): Date => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const createProspectListData = (
  overrides: Partial<ProspectListData> = {}
): ProspectListData => ({
  id: 'p1',
  name: 'Jane Doe',
  status: 'dating',
  createdAt: daysAgo(30),
  updatedAt: daysAgo(1),
  ...overrides,
});

const createProspect = (overrides: Partial<Prospect> = {}): Prospect => ({
  id: 'p1',
  name: 'Jane Doe',
  status: 'dating',
  traits: [],
  dates: [],
  createdAt: daysAgo(30),
  updatedAt: daysAgo(1),
  ...overrides,
});

describe('generateHomePrompts', () => {
  it('returns empty array when no prospects have cachedLastDateAt', () => {
    const prospects = [createProspectListData()];
    expect(generateHomePrompts(prospects, new Set())).toEqual([]);
  });

  it('returns date reminder for prospect with last date 12+ days ago', () => {
    const prospects = [
      createProspectListData({
        cachedLastDateAt: daysAgo(DATE_REMINDER_DAYS + 1),
      }),
    ];
    const result = generateHomePrompts(prospects, new Set());
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('date_reminder');
    expect(result[0].prospectId).toBe('p1');
    expect(result[0].messageParams?.name).toBe('Jane');
  });

  it('skips prospects with recent dates (< 12 days)', () => {
    const prospects = [
      createProspectListData({
        cachedLastDateAt: daysAgo(DATE_REMINDER_DAYS - 1),
      }),
    ];
    expect(generateHomePrompts(prospects, new Set())).toEqual([]);
  });

  it('skips archived/non-active prospects', () => {
    const prospects = [
      createProspectListData({
        status: 'archived',
        cachedLastDateAt: daysAgo(DATE_REMINDER_DAYS + 5),
      }),
    ];
    expect(generateHomePrompts(prospects, new Set())).toEqual([]);
  });

  it('skips dismissed prompts', () => {
    const prospects = [
      createProspectListData({
        cachedLastDateAt: daysAgo(DATE_REMINDER_DAYS + 1),
      }),
    ];
    const dismissed = new Set(['date_reminder_p1']);
    expect(generateHomePrompts(prospects, dismissed)).toEqual([]);
  });

  it('returns results sorted by priority', () => {
    const prospects = [
      createProspectListData({
        id: 'p1',
        name: 'Alice',
        cachedLastDateAt: daysAgo(DATE_REMINDER_DAYS + 1),
      }),
      createProspectListData({
        id: 'p2',
        name: 'Bob',
        cachedLastDateAt: daysAgo(DATE_REMINDER_DAYS + 5),
      }),
    ];
    const result = generateHomePrompts(prospects, new Set());
    expect(result).toHaveLength(2);
    // Both have priority 2, should remain sorted
    expect(result[0].priority).toBeLessThanOrEqual(result[1].priority);
  });
});

describe('generateProspectPrompts', () => {
  it('returns date reminder when most recent date is 12+ days ago', () => {
    const prospect = createProspect({
      dates: [
        { id: 'd1', date: daysAgo(DATE_REMINDER_DAYS + 5), createdAt: daysAgo(20) },
        { id: 'd2', date: daysAgo(DATE_REMINDER_DAYS + 1), createdAt: daysAgo(15) },
      ],
    });
    const result = generateProspectPrompts(prospect, new Set());
    const dateReminder = result.find((p) => p.type === 'date_reminder');
    expect(dateReminder).toBeDefined();
    expect(dateReminder?.priority).toBe(2);
  });

  it('returns no date reminder when dates are recent', () => {
    const prospect = createProspect({
      dates: [
        { id: 'd1', date: daysAgo(DATE_REMINDER_DAYS - 1), createdAt: daysAgo(5) },
      ],
    });
    const result = generateProspectPrompts(prospect, new Set());
    expect(result.find((p) => p.type === 'date_reminder')).toBeUndefined();
  });

  it('returns dealbreaker check when 4+ dates AND 3+ unknown dealbreakers', () => {
    const dates = Array.from({ length: DEALBREAKER_CHECK_MIN_DATES }, (_, i) => ({
      id: `d${i}`,
      date: daysAgo(i + 1),
      createdAt: daysAgo(i + 1),
    }));
    const traits = Array.from({ length: DEALBREAKER_CHECK_MIN_UNKNOWN }, (_, i) => ({
      id: `t${i}`,
      attributeId: `a${i}`,
      attributeName: `Trait ${i}`,
      attributeCategory: 'dealbreaker' as const,
      state: 'unknown' as const,
      updatedAt: new Date(),
    }));
    const prospect = createProspect({ dates, traits });
    const result = generateProspectPrompts(prospect, new Set());
    const dealbreakerCheck = result.find((p) => p.type === 'dealbreaker_check');
    expect(dealbreakerCheck).toBeDefined();
    expect(dealbreakerCheck?.priority).toBe(1);
    expect(dealbreakerCheck?.messageParams?.count).toBe(DEALBREAKER_CHECK_MIN_UNKNOWN);
  });

  it('returns no dealbreaker check when < 4 dates', () => {
    const dates = Array.from({ length: DEALBREAKER_CHECK_MIN_DATES - 1 }, (_, i) => ({
      id: `d${i}`,
      date: daysAgo(i + 1),
      createdAt: daysAgo(i + 1),
    }));
    const traits = Array.from({ length: DEALBREAKER_CHECK_MIN_UNKNOWN }, (_, i) => ({
      id: `t${i}`,
      attributeId: `a${i}`,
      attributeName: `Trait ${i}`,
      attributeCategory: 'dealbreaker' as const,
      state: 'unknown' as const,
      updatedAt: new Date(),
    }));
    const prospect = createProspect({ dates, traits });
    const result = generateProspectPrompts(prospect, new Set());
    expect(result.find((p) => p.type === 'dealbreaker_check')).toBeUndefined();
  });

  it('returns no dealbreaker check when < 3 unknown dealbreakers', () => {
    const dates = Array.from({ length: DEALBREAKER_CHECK_MIN_DATES }, (_, i) => ({
      id: `d${i}`,
      date: daysAgo(i + 1),
      createdAt: daysAgo(i + 1),
    }));
    const traits = Array.from({ length: DEALBREAKER_CHECK_MIN_UNKNOWN - 1 }, (_, i) => ({
      id: `t${i}`,
      attributeId: `a${i}`,
      attributeName: `Trait ${i}`,
      attributeCategory: 'dealbreaker' as const,
      state: 'unknown' as const,
      updatedAt: new Date(),
    }));
    const prospect = createProspect({ dates, traits });
    const result = generateProspectPrompts(prospect, new Set());
    expect(result.find((p) => p.type === 'dealbreaker_check')).toBeUndefined();
  });

  it('returns milestone prompt for relationship status', () => {
    const prospect = createProspect({ status: 'relationship' });
    const result = generateProspectPrompts(prospect, new Set());
    const milestone = result.find(
      (p) => p.type === 'milestone' && p.messageKey === 'prompts:milestoneRelationship'
    );
    expect(milestone).toBeDefined();
    expect(milestone?.priority).toBe(3);
    expect(milestone?.mascotState).toBe('celebrating');
  });

  it('returns milestone prompt when all dealbreakers confirmed', () => {
    const traits = [
      {
        id: 't1',
        attributeId: 'a1',
        attributeName: 'Honesty',
        attributeCategory: 'dealbreaker' as const,
        state: 'yes' as const,
        updatedAt: new Date(),
      },
      {
        id: 't2',
        attributeId: 'a2',
        attributeName: 'Kindness',
        attributeCategory: 'dealbreaker' as const,
        state: 'no' as const,
        updatedAt: new Date(),
      },
    ];
    const prospect = createProspect({ traits });
    const result = generateProspectPrompts(prospect, new Set());
    const milestone = result.find(
      (p) => p.type === 'milestone' && p.messageKey === 'prompts:milestoneAllDealbreakers'
    );
    expect(milestone).toBeDefined();
    expect(milestone?.mascotState).toBe('happy');
  });

  it('returns no milestone when dealbreakers not all confirmed', () => {
    const traits = [
      {
        id: 't1',
        attributeId: 'a1',
        attributeName: 'Honesty',
        attributeCategory: 'dealbreaker' as const,
        state: 'yes' as const,
        updatedAt: new Date(),
      },
      {
        id: 't2',
        attributeId: 'a2',
        attributeName: 'Kindness',
        attributeCategory: 'dealbreaker' as const,
        state: 'unknown' as const,
        updatedAt: new Date(),
      },
    ];
    const prospect = createProspect({ traits });
    const result = generateProspectPrompts(prospect, new Set());
    expect(
      result.find(
        (p) => p.type === 'milestone' && p.messageKey === 'prompts:milestoneAllDealbreakers'
      )
    ).toBeUndefined();
  });

  it('excludes dismissed prompts', () => {
    const prospect = createProspect({
      status: 'relationship',
      dates: [
        { id: 'd1', date: daysAgo(DATE_REMINDER_DAYS + 1), createdAt: daysAgo(15) },
      ],
    });
    const dismissed = new Set([
      `date_reminder_${prospect.id}`,
      `milestone_relationship_${prospect.id}`,
    ]);
    const result = generateProspectPrompts(prospect, dismissed);
    expect(result.find((p) => p.type === 'date_reminder')).toBeUndefined();
    expect(
      result.find(
        (p) => p.type === 'milestone' && p.messageKey === 'prompts:milestoneRelationship'
      )
    ).toBeUndefined();
  });

  it('returns results sorted by priority (dealbreaker_check=1 before date_reminder=2 before milestone=3)', () => {
    const dates = Array.from({ length: DEALBREAKER_CHECK_MIN_DATES }, (_, i) => ({
      id: `d${i}`,
      date: daysAgo(DATE_REMINDER_DAYS + i + 1),
      createdAt: daysAgo(DATE_REMINDER_DAYS + i + 1),
    }));
    const traits = Array.from({ length: DEALBREAKER_CHECK_MIN_UNKNOWN }, (_, i) => ({
      id: `t${i}`,
      attributeId: `a${i}`,
      attributeName: `Trait ${i}`,
      attributeCategory: 'dealbreaker' as const,
      state: 'unknown' as const,
      updatedAt: new Date(),
    }));
    const prospect = createProspect({
      status: 'relationship',
      dates,
      traits,
    });

    const result = generateProspectPrompts(prospect, new Set());
    expect(result.length).toBeGreaterThanOrEqual(2);

    // Verify sorting
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priority).toBeGreaterThanOrEqual(result[i - 1].priority);
    }

    // Verify specific order
    const types = result.map((p) => p.type);
    const dealbreakerIdx = types.indexOf('dealbreaker_check');
    const dateReminderIdx = types.indexOf('date_reminder');
    if (dealbreakerIdx !== -1 && dateReminderIdx !== -1) {
      expect(dealbreakerIdx).toBeLessThan(dateReminderIdx);
    }
  });
});

describe('getGeneralTip', () => {
  it('returns tip for user within 30 days', () => {
    const result = getGeneralTip(5, new Set());
    expect(result).not.toBeNull();
    expect(result?.type).toBe('general_tip');
    expect(result?.priority).toBe(4);
  });

  it('returns null for user beyond 30 days', () => {
    const result = getGeneralTip(GENERAL_TIP_MAX_DAYS + 1, new Set());
    expect(result).toBeNull();
  });

  it('rotates tips based on daysSinceJoined % 5', () => {
    const tip0 = getGeneralTip(0, new Set());
    const tip5 = getGeneralTip(5, new Set());
    const tip1 = getGeneralTip(1, new Set());

    // Day 0 and day 5 should produce the same tip index (0 % 5 === 5 % 5)
    expect(tip0?.messageKey).toBe(tip5?.messageKey);
    expect(tip0?.id).toBe(tip5?.id);

    // Day 1 should produce a different tip
    expect(tip1?.messageKey).not.toBe(tip0?.messageKey);

    // Verify the tip index rotation
    for (let day = 0; day < GENERAL_TIP_COUNT; day++) {
      const tip = getGeneralTip(day, new Set());
      expect(tip?.messageKey).toBe(`prompts:tip${day % GENERAL_TIP_COUNT}`);
    }
  });

  it('returns null when tip is dismissed', () => {
    const tipIndex = 5 % GENERAL_TIP_COUNT; // = 0
    const dismissed = new Set([`general_tip_${tipIndex}`]);
    const result = getGeneralTip(5, dismissed);
    expect(result).toBeNull();
  });
});

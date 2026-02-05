import { PRESET_ATTRIBUTES, getRandomPresets } from '@/constants/translations/presetAttributes';

describe('PRESET_ATTRIBUTES', () => {
  it('contains at least 40 attributes', () => {
    expect(PRESET_ATTRIBUTES.length).toBeGreaterThanOrEqual(40);
  });

  it('has no duplicates', () => {
    const lower = PRESET_ATTRIBUTES.map((a) => a.toLowerCase());
    expect(new Set(lower).size).toBe(lower.length);
  });
});

describe('getRandomPresets', () => {
  it('returns the requested number of presets', () => {
    const result = getRandomPresets(5);
    expect(result).toHaveLength(5);
  });

  it('returns all valid preset values', () => {
    const result = getRandomPresets(10);
    result.forEach((r) => {
      expect(PRESET_ATTRIBUTES).toContain(r);
    });
  });

  it('excludes specified attributes', () => {
    const exclude = ['Kind', 'Honest', 'Funny'];
    const result = getRandomPresets(10, exclude);
    exclude.forEach((e) => {
      expect(result).not.toContain(e);
    });
  });

  it('excludes case-insensitively', () => {
    const result = getRandomPresets(50, ['kind', 'HONEST']);
    expect(result).not.toContain('Kind');
    expect(result).not.toContain('Honest');
  });

  it('returns fewer if not enough available after exclusion', () => {
    const allButTwo = PRESET_ATTRIBUTES.slice(2).map((a) => a);
    const result = getRandomPresets(10, allButTwo);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

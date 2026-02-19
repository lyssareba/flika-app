import { FEATURE_FLAGS } from '../featureFlags';

describe('featureFlags', () => {
  it('has paywallEnabled set to false for soft launch', () => {
    expect(FEATURE_FLAGS.paywallEnabled).toBe(false);
  });

  it('has earlyAdopterEnabled set to true', () => {
    expect(FEATURE_FLAGS.earlyAdopterEnabled).toBe(true);
  });
});

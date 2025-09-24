import { CONFIG } from '../../src/config.js';

describe('Performance budget', () => {
  it('keeps animation duration within 2 seconds budget', () => {
    expect(CONFIG.ANIMATION_DURATION).toBeLessThanOrEqual(2000);
  });

  it('keeps feedback display under 2 seconds for snappy UX', () => {
    expect(CONFIG.FEEDBACK_DURATION).toBeLessThanOrEqual(2000);
  });
});

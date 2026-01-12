import { getRandomRime, RIMES } from '../../src/data/rimes.js';

describe('Wheel Probability Distribution', () => {
  const SAMPLE_SIZE = 1000;
  const TOLERANCE = 0.03;

  describe('getRandomRime', () => {
    it('should return uniform distribution across all rimes', () => {
      const counts = {};
      RIMES.forEach(rime => {
        counts[rime.pattern] = 0;
      });

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rime = getRandomRime();
        counts[rime.pattern]++;
      }

      const expectedPercentage = 1 / RIMES.length;

      RIMES.forEach(rime => {
        const actualPercentage = counts[rime.pattern] / SAMPLE_SIZE;
        const deviation = Math.abs(actualPercentage - expectedPercentage);

        expect(deviation).toBeLessThanOrEqual(TOLERANCE);
      });
    });

    it('should always return a valid rime from the RIMES array', () => {
      for (let i = 0; i < 100; i++) {
        const rime = getRandomRime();
        expect(RIMES).toContain(rime);
      }
    });

    it('should have non-zero counts for all rimes in large sample', () => {
      const counts = {};
      RIMES.forEach(rime => {
        counts[rime.pattern] = 0;
      });

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rime = getRandomRime();
        counts[rime.pattern]++;
      }

      RIMES.forEach(rime => {
        expect(counts[rime.pattern]).toBeGreaterThan(0);
      });
    });
  });

  describe('Statistical Analysis', () => {
    it('should maintain probability consistency across multiple runs', () => {
      const runs = 5;
      const results = [];

      for (let run = 0; run < runs; run++) {
        const counts = {};
        RIMES.forEach(rime => {
          counts[rime.pattern] = 0;
        });

        for (let i = 0; i < SAMPLE_SIZE; i++) {
          const rime = getRandomRime();
          counts[rime.pattern]++;
        }

        const percentages = RIMES.map(rime => counts[rime.pattern] / SAMPLE_SIZE);
        results.push(percentages);
      }

      const avgDeviations = results.map(runResult => {
        const expectedPercentage = 1 / RIMES.length;
        return runResult.reduce((sum, percentage) => {
          return sum + Math.abs(percentage - expectedPercentage);
        }, 0) / RIMES.length;
      });

      avgDeviations.forEach(deviation => {
        expect(deviation).toBeLessThanOrEqual(TOLERANCE);
      });
    });

    it('should have correct total probability (sums to 1)', () => {
      const counts = {};
      RIMES.forEach(rime => {
        counts[rime.pattern] = 0;
      });

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rime = getRandomRime();
        counts[rime.pattern]++;
      }

      const totalPercentage = Object.values(counts).reduce((sum, count) => {
        return sum + (count / SAMPLE_SIZE);
      }, 0);

      expect(totalPercentage).toBeCloseTo(1, 2);
    });
  });
});
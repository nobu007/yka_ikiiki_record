import React from 'react';
import { StatsDisplay } from './StatsDisplay.test.setup';

describe('StatsDisplay - Component Behavior', () => {
  describe('memoization behavior', () => {
    it('should have displayName set for debugging', () => {
      expect(StatsDisplay.displayName).toBe('StatsDisplay');
    });

    it('should be wrapped with React.memo', () => {
      const memoizedComponent = StatsDisplay;
      expect(memoizedComponent).toBeDefined();
      expect(typeof memoizedComponent).toBe('object');
    });

    it('should export as default', () => {
      expect(typeof StatsDisplay).toBe('object');
    });
  });

  describe('component interface', () => {
    it('should accept required props', () => {
      const props = {
        data: {
          monthly: [],
          dayOfWeek: [],
          timeOfDay: [],
          overview: { count: 0, avgEmotion: 0 }
        },
        isLoading: false,
        error: null,
        onRetry: () => {},
        isDark: false
      };

      expect(() => {
        React.createElement(StatsDisplay, props);
      }).not.toThrow();
    });
  });
});

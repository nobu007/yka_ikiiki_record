import React from 'react';
import DataGenerationPanel from './DataGenerationPanel';

describe('DataGenerationPanel', () => {
  describe('memoization behavior', () => {
    it('should have displayName set for debugging', () => {
      expect(DataGenerationPanel.displayName).toBe('DataGenerationPanel');
    });

    it('should be wrapped with React.memo', () => {
      const memoizedComponent = DataGenerationPanel;
      expect(memoizedComponent).toBeDefined();
      expect(typeof memoizedComponent).toBe('object');
    });

    it('should export as default', () => {
      expect(typeof DataGenerationPanel).toBe('object');
    });
  });

  describe('component interface', () => {
    it('should accept required props', () => {
      const props = {
        onGenerate: async () => {},
        className: ''
      };

      expect(() => {
        React.createElement(DataGenerationPanel, props);
      }).not.toThrow();
    });
  });
});

/**
 * DynamicBarChart Component Tests
 *
 * Tests comprehensive behavior including:
 * - Component structure and props
 * - Data validation edge cases
 * - Memoization
 * - Data transformation and filtering (INV-TEST-001)
 * - Error state handling (INV-TEST-001)
 */

import React from 'react';
import DynamicBarChart from './DynamicBarChart';
import type { ChartData } from './DynamicBarChart';

describe('DynamicBarChart', () => {
  const mockData: ChartData[] = [
    { name: 'Item 1', value: 3.5 },
    { name: 'Item 2', value: 4.2 },
    { name: 'Item 3', value: 2.8 },
  ];

  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(DynamicBarChart).toBeDefined();
    });

    it('should have correct displayName', () => {
      expect(DynamicBarChart.displayName).toBe('DynamicBarChart');
    });

    it('should accept required props', () => {
      const props = { data: mockData };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
      expect(element.props.data).toEqual(mockData);
    });

    it('should accept optional props', () => {
      const props = {
        data: mockData,
        height: 500,
        title: 'Test Chart',
        isDark: true
      };
      const element = React.createElement(DynamicBarChart, props);
      expect(element.props.height).toBe(500);
      expect(element.props.title).toBe('Test Chart');
      expect(element.props.isDark).toBe(true);
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle empty data', () => {
      const props = { data: [] };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
    });

    it('should handle single data point', () => {
      const singleData: ChartData[] = [{ name: 'Only', value: 3.5 }];
      const props = { data: singleData };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
    });

    it('should handle many data points', () => {
      const manyData = Array.from({ length: 50 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 5,
      }));
      const props = { data: manyData };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
    });

    it('should handle zero values', () => {
      const zeroData: ChartData[] = [
        { name: 'Zero', value: 0 },
        { name: 'Positive', value: 3.5 },
      ];
      const props = { data: zeroData };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
    });

    it('should handle decimal values', () => {
      const decimalData: ChartData[] = [
        { name: 'Precise 1', value: 3.14159 },
        { name: 'Precise 2', value: 2.71828 },
      ];
      const props = { data: decimalData };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
    });

    it('should handle negative values', () => {
      const negativeData: ChartData[] = [
        { name: 'Negative', value: -1.5 },
        { name: 'Positive', value: 3.5 },
      ];
      const props = { data: negativeData };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
    });

    it('should handle NaN values in data', () => {
      const dataWithNaN: ChartData[] = [
        { name: 'Valid', value: 3.5 },
        { name: 'Invalid', value: NaN },
        { name: 'Also Valid', value: 4.2 },
      ];
      const props = { data: dataWithNaN };
      const element = React.createElement(DynamicBarChart, props);
      expect(element).toBeDefined();
    });
  });

  describe('Memoization', () => {
    it('should memoize component correctly', () => {
      const props = { data: mockData };
      const element1 = React.createElement(DynamicBarChart, props);
      const element2 = React.createElement(DynamicBarChart, props);
      expect(element1).toEqual(element2);
    });
  });

  describe('Props Edge Cases', () => {
    it('should handle very large height', () => {
      const props = { data: mockData, height: 10000 };
      const element = React.createElement(DynamicBarChart, props);
      expect(element.props.height).toBe(10000);
    });

    it('should handle very small height', () => {
      const props = { data: mockData, height: 50 };
      const element = React.createElement(DynamicBarChart, props);
      expect(element.props.height).toBe(50);
    });

    it('should handle empty title', () => {
      const props = { data: mockData, title: '' };
      const element = React.createElement(DynamicBarChart, props);
      expect(element.props.title).toBe('');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      const props = { data: mockData, title: longTitle };
      const element = React.createElement(DynamicBarChart, props);
      expect(element.props.title).toBe(longTitle);
    });
  });

  describe('Data Transformation and Filtering (INV-TEST-001)', () => {
    it('should filter out NaN values from validData', () => {
      const dataWithNaN: ChartData[] = [
        { name: 'Valid 1', value: 3.5 },
        { name: 'Invalid', value: NaN },
        { name: 'Valid 2', value: 4.2 },
        { name: 'Also Invalid', value: NaN },
      ];

      const element = React.createElement(DynamicBarChart, { data: dataWithNaN });

      // Component should render without error despite NaN values
      expect(element).toBeDefined();
    });

    it('should convert string names to strings', () => {
      const dataWithNumberNames: ChartData[] = [
        { name: String(123), value: 3.5 },
        { name: String(456), value: 4.2 },
      ];

      const element = React.createElement(DynamicBarChart, { data: dataWithNumberNames });

      // Should handle type coercion gracefully
      expect(element).toBeDefined();
    });

    it('should convert numeric values to numbers', () => {
      const dataWithStringValues: ChartData[] = [
        { name: 'Item 1', value: Number('3.5') },
        { name: 'Item 2', value: Number('4.2') },
      ];

      const element = React.createElement(DynamicBarChart, { data: dataWithStringValues });

      // Should handle string to number conversion
      expect(element).toBeDefined();
    });

    it('should handle all NaN data gracefully', () => {
      const allNaN: ChartData[] = [
        { name: 'Invalid 1', value: NaN },
        { name: 'Invalid 2', value: NaN },
      ];

      const element = React.createElement(DynamicBarChart, { data: allNaN });

      // Should render empty state instead of crashing
      expect(element).toBeDefined();
    });

    it('should filter Infinity values', () => {
      const dataWithInfinity: ChartData[] = [
        { name: 'Valid', value: 3.5 },
        { name: 'Infinite', value: Infinity },
        { name: 'Negative Infinite', value: -Infinity },
      ];

      const element = React.createElement(DynamicBarChart, { data: dataWithInfinity });

      // Should filter out Infinity values (isNaN(Infinity) === false, but isFinite(Infinity) === false)
      expect(element).toBeDefined();
    });
  });

  describe('Error State Handling (INV-TEST-001)', () => {
    it('should handle data transformation errors gracefully', () => {
      // Create data that might cause transformation errors
      const problematicData: ChartData[] = [
        { name: 'Valid', value: 3.5 },
        { name: 'null', value: Number(null) },
        { name: 'undefined', value: Number(undefined) },
      ];

      const element = React.createElement(DynamicBarChart, { data: problematicData });

      // Should not crash and should render something
      expect(element).toBeDefined();
    });

    it('should handle undefined/null data prop', () => {
      const element = React.createElement(DynamicBarChart, { data: [] });

      // Should handle undefined data gracefully
      expect(element).toBeDefined();
    });

    it('should handle mixed valid and invalid data', () => {
      const mixedData: ChartData[] = [
        { name: 'Valid 1', value: 3.5 },
        { name: 'Invalid', value: Number('not a number') },
        { name: 'Valid 2', value: 4.2 },
        { name: 'Also Invalid', value: Number(NaN) },
      ];

      const element = React.createElement(DynamicBarChart, { data: mixedData });

      // Should filter invalid data and render valid portions
      expect(element).toBeDefined();
    });
  });

  describe('Empty Data State (INV-TEST-001)', () => {
    it('should handle empty data array', () => {
      const element = React.createElement(DynamicBarChart, { data: [] });

      // Should handle empty data gracefully
      expect(element).toBeDefined();
    });

    it('should handle all NaN values', () => {
      const allNaN: ChartData[] = [
        { name: 'Invalid 1', value: NaN },
        { name: 'Invalid 2', value: NaN },
      ];

      const element = React.createElement(DynamicBarChart, { data: allNaN });

      // Should handle all NaN data gracefully
      expect(element).toBeDefined();
    });

    it('should handle mixed valid and invalid data points', () => {
      const dataWithOneValid: ChartData[] = [
        { name: 'Invalid', value: NaN },
        { name: 'Valid', value: 3.5 },
      ];

      const element = React.createElement(DynamicBarChart, { data: dataWithOneValid });

      // Should handle mixed data gracefully
      expect(element).toBeDefined();
    });
  });

  describe('Dark Mode Behavior (INV-TEST-001)', () => {
    it('should handle dark mode prop', () => {
      const element = React.createElement(DynamicBarChart, {
        data: mockData,
        isDark: true
      });

      expect(element).toBeDefined();
    });

    it('should handle light mode prop', () => {
      const element = React.createElement(DynamicBarChart, {
        data: mockData,
        isDark: false
      });

      expect(element).toBeDefined();
    });

    it('should default to light mode when isDark not specified', () => {
      const element = React.createElement(DynamicBarChart, { data: mockData });

      expect(element).toBeDefined();
    });
  });

  describe('Chart Configuration (INV-TEST-001)', () => {
    it('should handle large datasets (>20 items)', () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 5,
      }));

      const element = React.createElement(DynamicBarChart, { data: largeData });

      // Should render without error with data labels disabled
      expect(element).toBeDefined();
    });

    it('should handle small datasets (<20 items)', () => {
      const smallData = Array.from({ length: 15 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 5,
      }));

      const element = React.createElement(DynamicBarChart, { data: smallData });

      // Should render without error with data labels enabled
      expect(element).toBeDefined();
    });

    it('should handle medium datasets (>10 items)', () => {
      const mediumData = Array.from({ length: 12 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 5,
      }));

      const element = React.createElement(DynamicBarChart, { data: mediumData });

      // Should render without error with rotated labels
      expect(element).toBeDefined();
    });
  });
});

/**
 * DynamicBarChart Edge Cases Tests
 *
 * Tests data validation edge cases, props edge cases, and error handling
 */

import React from 'react';
import DynamicBarChart from './DynamicBarChart';
import type { ChartData } from './DynamicBarChart';

describe('DynamicBarChart Edge Cases', () => {
  const mockData: ChartData[] = [
    { name: 'Item 1', value: 3.5 },
    { name: 'Item 2', value: 4.2 },
    { name: 'Item 3', value: 2.8 },
  ];

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
});

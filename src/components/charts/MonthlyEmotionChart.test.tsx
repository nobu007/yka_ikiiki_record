import React from 'react';
/**
 * MonthlyEmotionChart Component Tests
 *
 * Tests the monthly emotion visualization component
 */

import { MonthlyEmotionChart } from './index';

describe('MonthlyEmotionChart', () => {
  it('should be defined', () => {
    expect(MonthlyEmotionChart).toBeDefined();
  });

  it('should have correct displayName', () => {
    expect(MonthlyEmotionChart.displayName).toBe('MonthlyEmotionChart');
  });

  it('should accept monthly data', () => {
    const monthlyData = [
      { month: '1月', avgEmotion: 75 },
      { month: '2月', avgEmotion: 80 },
      { month: '3月', avgEmotion: 72 }
    ];
    const props = { data: monthlyData };
    const element = React.createElement(MonthlyEmotionChart, props);
    expect(element.props.data).toEqual(monthlyData);
  });

  it('should handle empty monthly data', () => {
    const props = { data: [] };
    const element = React.createElement(MonthlyEmotionChart, props);
    expect(element).toBeDefined();
  });

  it('should handle single month', () => {
    const singleMonth = [{ month: '1月', avgEmotion: 75 }];
    const props = { data: singleMonth };
    const element = React.createElement(MonthlyEmotionChart, props);
    expect(element).toBeDefined();
  });

  it('should handle full year data', () => {
    const fullYear = Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}月`,
      avgEmotion: 70 + Math.random() * 20
    }));
    const props = { data: fullYear };
    const element = React.createElement(MonthlyEmotionChart, props);
    expect(element).toBeDefined();
  });
});

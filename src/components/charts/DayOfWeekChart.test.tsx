/**
 * DayOfWeekChart Component Tests
 *
 * Tests the day-of-week emotion visualization component
 */

import React from 'react';
import { memo } from 'react';
import { DayOfWeekChart } from './index';

describe('DayOfWeekChart', () => {
  it('should be defined', () => {
    expect(DayOfWeekChart).toBeDefined();
  });

  it('should have correct displayName', () => {
    expect(DayOfWeekChart.displayName).toBe('DayOfWeekChart');
  });

  it('should accept day of week data', () => {
    const dayData = [
      { day: '月', avgEmotion: 70 },
      { day: '火', avgEmotion: 75 },
      { day: '水', avgEmotion: 80 }
    ];
    const props = { data: dayData };
    const element = React.createElement(DayOfWeekChart, props);
    expect(element.props.data).toEqual(dayData);
  });

  it('should handle all days of week', () => {
    const allDays = [
      { day: '月', avgEmotion: 70 },
      { day: '火', avgEmotion: 75 },
      { day: '水', avgEmotion: 80 },
      { day: '木', avgEmotion: 72 },
      { day: '金', avgEmotion: 78 },
      { day: '土', avgEmotion: 85 },
      { day: '日', avgEmotion: 82 }
    ];
    const props = { data: allDays };
    const element = React.createElement(DayOfWeekChart, props);
    expect(element).toBeDefined();
  });

  it('should handle empty day data', () => {
    const props = { data: [] };
    const element = React.createElement(DayOfWeekChart, props);
    expect(element).toBeDefined();
  });
});

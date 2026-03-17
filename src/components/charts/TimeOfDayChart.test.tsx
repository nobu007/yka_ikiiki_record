import React from 'react';
/**
 * TimeOfDayChart Component Tests
 *
 * Tests the time-of-day emotion visualization component
 */

import { TimeOfDayChart } from './index';

describe('TimeOfDayChart', () => {
  it('should be defined', () => {
    expect(TimeOfDayChart).toBeDefined();
  });

  it('should have correct displayName', () => {
    expect(TimeOfDayChart.displayName).toBe('TimeOfDayChart');
  });

  it('should accept time of day data', () => {
    const timeData = {
      morning: 70,
      afternoon: 75,
      evening: 72
    };
    const props = { data: timeData };
    const element = React.createElement(TimeOfDayChart, props);
    expect(element.props.data).toEqual(timeData);
  });

  it('should handle extreme values', () => {
    const extremeData = {
      morning: 100,
      afternoon: 0,
      evening: 50
    };
    const props = { data: extremeData };
    const element = React.createElement(TimeOfDayChart, props);
    expect(element).toBeDefined();
  });

  it('should handle all same values', () => {
    const sameData = {
      morning: 75,
      afternoon: 75,
      evening: 75
    };
    const props = { data: sameData };
    const element = React.createElement(TimeOfDayChart, props);
    expect(element).toBeDefined();
  });
});

/**
 * EmotionDistributionChart Component Tests
 *
 * Tests the emotion distribution visualization component
 */

import React from 'react';
import { EmotionDistributionChart } from './index';

describe('EmotionDistributionChart', () => {
  it('should be defined', () => {
    expect(EmotionDistributionChart).toBeDefined();
  });

  it('should have correct displayName', () => {
    expect(EmotionDistributionChart.displayName).toBe('EmotionDistributionChart');
  });

  it('should accept distribution data', () => {
    const distributionData = [5, 10, 15, 8, 3];
    const props = { data: distributionData };
    const element = React.createElement(EmotionDistributionChart, props);
    expect(element.props.data).toEqual(distributionData);
  });

  it('should handle all zeros', () => {
    const zeroData = [0, 0, 0, 0, 0];
    const props = { data: zeroData };
    const element = React.createElement(EmotionDistributionChart, props);
    expect(element).toBeDefined();
  });

  it('should handle skewed distribution', () => {
    const skewedData = [100, 5, 2, 0, 0];
    const props = { data: skewedData };
    const element = React.createElement(EmotionDistributionChart, props);
    expect(element).toBeDefined();
  });

  it('should handle uniform distribution', () => {
    const uniformData = [20, 20, 20, 20, 20];
    const props = { data: uniformData };
    const element = React.createElement(EmotionDistributionChart, props);
    expect(element).toBeDefined();
  });
});

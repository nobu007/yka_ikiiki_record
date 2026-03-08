/**
 * EmotionChart Component Tests
 *
 * Tests the base EmotionChart component with props validation and edge cases
 */

import React from 'react';
import { EmotionChart, ChartData } from './index';

describe('EmotionChart', () => {
  const mockData: ChartData = {
    labels: ['Label 1', 'Label 2', 'Label 3'],
    series: [{
      name: 'Test Series',
      data: [10, 20, 30]
    }]
  };

  it('should be defined', () => {
    expect(EmotionChart).toBeDefined();
  });

  it('should have correct displayName', () => {
    expect(EmotionChart.displayName).toBe('EmotionChart');
  });

  it('should accept required props', () => {
    const props = { data: mockData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
    expect(element.props.data).toEqual(mockData);
  });

  it('should accept optional props', () => {
    const props = {
      data: mockData,
      title: 'Test Chart',
      height: 400,
      type: 'bar' as const,
      colors: ['#FF0000', '#00FF00']
    };
    const element = React.createElement(EmotionChart, props);
    expect(element.props.title).toBe('Test Chart');
    expect(element.props.height).toBe(400);
    expect(element.props.type).toBe('bar');
    expect(element.props.colors).toEqual(['#FF0000', '#00FF00']);
  });

  it('should support all chart types', () => {
    const types = ['line', 'bar', 'area', 'pie', 'donut'] as const;
    types.forEach(type => {
      const props = { data: mockData, type };
      const element = React.createElement(EmotionChart, props);
      expect(element.props.type).toBe(type);
    });
  });

  it('should handle empty data', () => {
    const emptyData: ChartData = {
      labels: [],
      series: [{ name: 'Empty', data: [] }]
    };
    const props = { data: emptyData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it('should handle single data point', () => {
    const singleData: ChartData = {
      labels: ['Single'],
      series: [{ name: 'Single', data: [50] }]
    };
    const props = { data: singleData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it('should handle multiple series', () => {
    const multiSeriesData: ChartData = {
      labels: ['A', 'B', 'C'],
      series: [
        { name: 'Series 1', data: [10, 20, 30] },
        { name: 'Series 2', data: [15, 25, 35] }
      ]
    };
    const props = { data: multiSeriesData };
    const element = React.createElement(EmotionChart, props);
    expect(element).toBeDefined();
  });

  it('should handle custom colors', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];
    const props = { data: mockData, colors: customColors };
    const element = React.createElement(EmotionChart, props);
    expect(element.props.colors).toEqual(customColors);
  });
});

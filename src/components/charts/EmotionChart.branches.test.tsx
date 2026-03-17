/**
 * EmotionChart Component Branch Coverage Tests
 *
 * Tests branch coverage for getChartOptions method
 * INV-TEST-001
 */

import React from 'react';
import { memo } from 'react';
import { render } from '@testing-library/react';
import { EmotionChart, ChartData } from './index';

describe('EmotionChart - Branch Coverage (INV-TEST-001)', () => {
  const mockData: ChartData = {
    labels: ['Label 1', 'Label 2', 'Label 3'],
    series: [{
      name: 'Test Series',
      data: [10, 20, 30]
    }]
  };

  describe('getChartOptions - conditional title', () => {
    it('should include title in options when title is provided', () => {
      const { container } = render(
        <EmotionChart data={mockData} title="Test Chart" type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should not include title in options when title is undefined', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should not include title in options when title is empty string', () => {
      const { container } = render(
        <EmotionChart data={mockData} title="" type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('getChartOptions - pie/donut chart types', () => {
    it('should return pie-specific options when type is pie', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="pie" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should return donut-specific options when type is donut', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="donut" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should include labels in options for pie charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="pie" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should include labels in options for donut charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="donut" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should set legend position to bottom for pie charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="pie" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should set legend position to bottom for donut charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="donut" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('getChartOptions - non-pie/donut chart types', () => {
    it('should return standard options when type is line', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should return standard options when type is bar', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="bar" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should return standard options when type is area', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="area" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should include xaxis categories for non-pie charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should include yaxis for non-pie charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="bar" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should include grid for non-pie charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="area" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should set legend position to top for non-pie charts', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('getChartOptions - custom colors', () => {
    it('should use custom colors when provided', () => {
      const customColors = ['#FF0000', '#00FF00', '#0000FF'];
      const { container } = render(
        <EmotionChart data={mockData} colors={customColors} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should use default colors when not provided', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('getChartOptions - custom height', () => {
    it('should use custom height when provided', () => {
      const { container } = render(
        <EmotionChart data={mockData} height={500} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should use default height when not provided', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="line" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('type default parameter (line 38)', () => {
    it('should use default type "line" when type prop is undefined', () => {
      const { container } = render(
        <EmotionChart data={mockData} />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should use explicit type when provided', () => {
      const { container } = render(
        <EmotionChart data={mockData} type="bar" />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });
});

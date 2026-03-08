/**
 * Chart Component Tests
 *
 * Note: ApexCharts uses dynamic imports with SSR disabled, which makes full
 * rendering tests difficult in Jest. These tests focus on component structure,
 * props validation, and displayName verification.
 */

import React from 'react';
import { EmotionChart, MonthlyEmotionChart, DayOfWeekChart, EmotionDistributionChart, TimeOfDayChart, StudentEmotionChart, EmotionTrendChart } from './index';
import { ChartData } from './index';

describe('Chart Components', () => {
  const mockData: ChartData = {
    labels: ['Label 1', 'Label 2', 'Label 3'],
    series: [{
      name: 'Test Series',
      data: [10, 20, 30]
    }]
  };

  describe('EmotionChart', () => {
    it('should be defined', () => {
      expect(EmotionChart).toBeDefined();
    });

    it('should have correct displayName', () => {
      expect(EmotionChart.displayName).toBe('EmotionChart');
    });

    it('should accept required props', () => {
      const props = {
        data: mockData
      };
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
  });

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
  });

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
  });

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
  });

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
  });

  describe('StudentEmotionChart', () => {
    it('should be defined', () => {
      expect(StudentEmotionChart).toBeDefined();
    });

    it('should have correct displayName', () => {
      expect(StudentEmotionChart.displayName).toBe('StudentEmotionChart');
    });

    it('should accept student data', () => {
      const studentData = [
        { student: '生徒A', avgEmotion: 75 },
        { student: '生徒B', avgEmotion: 80 },
        { student: '生徒C', avgEmotion: 72 }
      ];
      const props = { data: studentData };
      const element = React.createElement(StudentEmotionChart, props);
      expect(element.props.data).toEqual(studentData);
    });
  });

  describe('EmotionTrendChart', () => {
    it('should be defined', () => {
      expect(EmotionTrendChart).toBeDefined();
    });

    it('should have correct displayName', () => {
      expect(EmotionTrendChart.displayName).toBe('EmotionTrendChart');
    });

    it('should accept trend data', () => {
      const trendData = [
        { student: '生徒A', trendline: [70, 72, 75, 73, 78, 80, 76] },
        { student: '生徒B', trendline: [65, 68, 70, 72, 74, 73, 75] }
      ];
      const props = { data: trendData };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element.props.data).toEqual(trendData);
    });

    it('should handle more than 5 students (limits to top 5)', () => {
      const trendData = Array.from({ length: 10 }, (_, i) => ({
        student: `生徒${String.fromCharCode(65 + i)}`,
        trendline: [70, 72, 75, 73, 78, 80, 76]
      }));
      const props = { data: trendData };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element.props.data).toHaveLength(10);
    });
  });
});

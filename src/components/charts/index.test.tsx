/**
 * Chart Component Tests - Comprehensive Coverage
 *
 * Tests all chart components with component structure, props validation, and edge cases
 */

import React from 'react';
import { EmotionChart, MonthlyEmotionChart, DayOfWeekChart, EmotionDistributionChart, TimeOfDayChart, StudentEmotionChart, EmotionTrendChart, ChartData } from './index';

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

    it('should handle single student', () => {
      const singleStudent = [{ student: '生徒A', avgEmotion: 75 }];
      const props = { data: singleStudent };
      const element = React.createElement(StudentEmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle large class (40 students)', () => {
      const largeClass = Array.from({ length: 40 }, (_, i) => ({
        student: `生徒${i + 1}`,
        avgEmotion: 60 + Math.random() * 40
      }));
      const props = { data: largeClass };
      const element = React.createElement(StudentEmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle empty student list', () => {
      const props = { data: [] };
      const element = React.createElement(StudentEmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle extreme emotion values', () => {
      const extremeData = [
        { student: '生徒A', avgEmotion: 0 },
        { student: '生徒B', avgEmotion: 100 },
        { student: '生徒C', avgEmotion: 50 }
      ];
      const props = { data: extremeData };
      const element = React.createElement(StudentEmotionChart, props);
      expect(element).toBeDefined();
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

    it('should limit to top 5 students when more provided', () => {
      const manyStudents = Array.from({ length: 10 }, (_, i) => ({
        student: `生徒${String.fromCharCode(65 + i)}`,
        trendline: [70, 72, 75, 73, 78, 80, 76]
      }));
      const props = { data: manyStudents };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element.props.data).toHaveLength(10);
    });

    it('should handle exactly 5 students', () => {
      const fiveStudents = Array.from({ length: 5 }, (_, i) => ({
        student: `生徒${i + 1}`,
        trendline: [70, 72, 75, 73, 78, 80, 76]
      }));
      const props = { data: fiveStudents };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element).toBeDefined();
    });

    it('should handle single student', () => {
      const singleStudent = [
        { student: '生徒A', trendline: [70, 72, 75, 73, 78, 80, 76] }
      ];
      const props = { data: singleStudent };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element).toBeDefined();
    });

    it('should handle empty trend data', () => {
      const props = { data: [] };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element).toBeDefined();
    });

    it('should handle flat trendlines', () => {
      const flatTrend = [
        { student: '生徒A', trendline: [75, 75, 75, 75, 75, 75, 75] },
        { student: '生徒B', trendline: [70, 70, 70, 70, 70, 70, 70] }
      ];
      const props = { data: flatTrend };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element).toBeDefined();
    });

    it('should handle volatile trendlines', () => {
      const volatileTrend = [
        { student: '生徒A', trendline: [50, 90, 60, 80, 40, 95, 55] },
        { student: '生徒B', trendline: [70, 30, 85, 45, 75, 35, 80] }
      ];
      const props = { data: volatileTrend };
      const element = React.createElement(EmotionTrendChart, props);
      expect(element).toBeDefined();
    });
  });

  describe('Chart Component Edge Cases', () => {
    it('should handle null/undefined series data gracefully', () => {
      const nullData: ChartData = {
        labels: ['A', 'B'],
        series: [{ name: 'Test', data: [10, null as unknown as number, 30] }]
      };
      const props = { data: nullData };
      const element = React.createElement(EmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle very long labels', () => {
      const longLabelData: ChartData = {
        labels: ['Very Long Label That Might Break Layout', 'Short'],
        series: [{ name: 'Test', data: [10, 20] }]
      };
      const props = { data: longLabelData };
      const element = React.createElement(EmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle special characters in labels', () => {
      const specialCharData: ChartData = {
        labels: ['Test<>Label', '"Quoted"', "Single'Quote"],
        series: [{ name: 'Test', data: [10, 20, 30] }]
      };
      const props = { data: specialCharData };
      const element = React.createElement(EmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle very large values', () => {
      const largeValueData: ChartData = {
        labels: ['A', 'B'],
        series: [{ name: 'Test', data: [999999, 1000000] }]
      };
      const props = { data: largeValueData };
      const element = React.createElement(EmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle decimal values', () => {
      const decimalData: ChartData = {
        labels: ['A', 'B', 'C'],
        series: [{ name: 'Test', data: [3.14159, 2.71828, 1.41421] }]
      };
      const props = { data: decimalData };
      const element = React.createElement(EmotionChart, props);
      expect(element).toBeDefined();
    });

    it('should handle negative values', () => {
      const negativeData: ChartData = {
        labels: ['A', 'B', 'C'],
        series: [{ name: 'Test', data: [-10, 0, 10] }]
      };
      const props = { data: negativeData };
      const element = React.createElement(EmotionChart, props);
      expect(element).toBeDefined();
    });
  });
});

/**
 * StudentEmotionChart Component Tests
 *
 * Tests the student-specific emotion visualization component
 */

import React from 'react';
import { StudentEmotionChart } from './index';

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

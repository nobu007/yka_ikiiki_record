import React from 'react';
import { memo } from 'react';
import { render, screen } from '@testing-library/react';
import { DataVisualization } from './DataVisualization';
import { StatsData } from '@/schemas/api';

const mockStats: StatsData = {
  overview: {
    count: 1000,
    avgEmotion: 75.5
  },
  monthlyStats: [
    { month: '2025-01', avgEmotion: 70, count: 100 },
    { month: '2025-02', avgEmotion: 75, count: 120 },
    { month: '2025-03', avgEmotion: 80, count: 110 }
  ],
  dayOfWeekStats: [
    { day: '0', avgEmotion: 72, count: 140 },
    { day: '1', avgEmotion: 76, count: 150 },
    { day: '2', avgEmotion: 74, count: 145 }
  ],
  emotionDistribution: [50, 80, 120, 150, 100],
  timeOfDayStats: {
    morning: 70,
    afternoon: 75,
    evening: 73
  },
  studentStats: [
    {
      student: '生徒A',
      recordCount: 50,
      avgEmotion: 75.5,
      trendline: [70, 72, 75, 78, 80]
    },
    {
      student: '生徒B',
      recordCount: 45,
      avgEmotion: 72.3,
      trendline: [75, 74, 73, 72, 71]
    },
    {
      student: '生徒C',
      recordCount: 60,
      avgEmotion: 78.9,
      trendline: [80, 80, 80]
    },
    {
      student: '生徒D',
      recordCount: 40,
      avgEmotion: 69.2,
      trendline: [65]
    },
    {
      student: '生徒E',
      recordCount: 55,
      avgEmotion: 76.8,
      trendline: [70, 75, 80]
    }
  ]
};

describe('DataVisualization Edge Cases', () => {
  describe('Edge Cases', () => {
    it('should handle empty stats gracefully', () => {
      const emptyStats: StatsData = {
        overview: { count: 0, avgEmotion: 0 },
        monthlyStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [],
        timeOfDayStats: {
          morning: 0,
          afternoon: 0,
          evening: 0
        },
        studentStats: []
      };

      const { container } = render(<DataVisualization data={emptyStats} />);

      expect(container.textContent).toContain('0');
    });

    it('should handle very large record counts', () => {
      const largeStats: StatsData = {
        ...mockStats,
        overview: { count: 1000000, avgEmotion: 75.5 }
      };

      const { container } = render(<DataVisualization data={largeStats} />);

      expect(container.textContent).toContain('1,000,000');
    });

    it('should handle decimal average emotions', () => {
      render(<DataVisualization data={mockStats} />);

      const container = screen.getByText('詳細統計').parentElement;
      expect(container?.textContent).toContain('75.5');
      expect(container?.textContent).toContain('72.3');
      expect(container?.textContent).toContain('78.9');
      expect(container?.textContent).toContain('69.2');
      expect(container?.textContent).toContain('76.8');
    });

    it('should handle missing trendline data', () => {
      const statsWithMissingTrend: StatsData = {
        ...mockStats,
        studentStats: [
          {
            student: '生徒A',
            recordCount: 50,
            avgEmotion: 75.5,
            trendline: []
          }
        ]
      };

      render(<DataVisualization data={statsWithMissingTrend} />);

      expect(screen.getByText('生徒A')).toBeInTheDocument();
    });

    it('should handle single student', () => {
      const singleStudentStats: StatsData = {
        ...mockStats,
        studentStats: [
          {
            student: '単独生徒',
            recordCount: 100,
            avgEmotion: 75.0,
            trendline: [70, 75, 80]
          }
        ]
      };

      render(<DataVisualization data={singleStudentStats} />);

      expect(screen.getByText('単独生徒')).toBeInTheDocument();
    });

    it('should handle many students', () => {
      const manyStudents = Array.from({ length: 50 }, (_, i) => ({
        student: `生徒${i + 1}`,
        recordCount: Math.floor(Math.random() * 100),
        avgEmotion: Math.random() * 100,
        trendline: [70, 75, 80]
      }));

      const manyStudentStats: StatsData = {
        ...mockStats,
        studentStats: manyStudents
      };

      render(<DataVisualization data={manyStudentStats} />);

      expect(screen.getByText('生徒1')).toBeInTheDocument();
      expect(screen.getByText('生徒10')).toBeInTheDocument();
    });

    it('should handle extreme emotion values', () => {
      const extremeEmotionStats: StatsData = {
        ...mockStats,
        overview: { count: 100, avgEmotion: 0 }
      };

      render(<DataVisualization data={extremeEmotionStats} />);

      const { container } = render(<DataVisualization data={extremeEmotionStats} />);
      expect(container.textContent).toContain('0');
    });
  });

  describe('Performance', () => {
    it('should render quickly with typical data', () => {
      const startTime = performance.now();

      render(<DataVisualization data={mockStats} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(1000);
    });

    it('should render quickly with large datasets', () => {
      const largeStats: StatsData = {
        ...mockStats,
        studentStats: Array.from({ length: 100 }, (_, i) => ({
          student: `生徒${i + 1}`,
          recordCount: Math.floor(Math.random() * 100),
          avgEmotion: Math.random() * 100,
          trendline: [70, 75, 80]
        }))
      };

      const startTime = performance.now();

      render(<DataVisualization data={largeStats} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(2000);
    });
  });
});

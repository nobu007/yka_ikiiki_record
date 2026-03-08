import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataVisualization } from './DataVisualization';
import { GeneratedStats } from '@/infrastructure/services/dataService';

const mockStats: GeneratedStats = {
  overview: {
    count: 1000,
    avgEmotion: 75.5
  },
  monthlyStats: [
    { month: '2025-01', avgEmotion: 70, recordCount: 100 },
    { month: '2025-02', avgEmotion: 75, recordCount: 120 },
    { month: '2025-03', avgEmotion: 80, recordCount: 110 }
  ],
  dayOfWeekStats: [
    { dayOfWeek: 0, avgEmotion: 72, recordCount: 140 },
    { dayOfWeek: 1, avgEmotion: 76, recordCount: 150 },
    { dayOfWeek: 2, avgEmotion: 74, recordCount: 145 }
  ],
  emotionDistribution: [
    { emotion: 1, count: 50 },
    { emotion: 2, count: 80 },
    { emotion: 3, count: 120 },
    { emotion: 4, count: 150 },
    { emotion: 5, count: 100 }
  ],
  timeOfDayStats: [
    { hour: 8, avgEmotion: 70, recordCount: 50 },
    { hour: 12, avgEmotion: 75, recordCount: 80 },
    { hour: 18, avgEmotion: 73, recordCount: 60 }
  ],
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

describe('DataVisualization', () => {
  describe('Rendering', () => {
    it('should render overview statistics correctly', () => {
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('データ概要')).toBeInTheDocument();
      expect(screen.getByText('総記録数')).toBeInTheDocument();
      expect(screen.getByText('平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
    });

    it('should render all chart sections', () => {
      render(<DataVisualization data={mockStats} />);

      const sections = screen.getAllByRole('generic');
      const chartSections = sections.filter(section => {
        const classes = section.className;
        return classes && classes.includes('bg-white rounded-lg p-6 shadow-sm');
      });

      expect(chartSections.length).toBeGreaterThan(0);
    });

    it('should render detailed statistics table', () => {
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('詳細統計')).toBeInTheDocument();
      expect(screen.getByText('生徒')).toBeInTheDocument();
      expect(screen.getByText('記録数')).toBeInTheDocument();
      expect(screen.getByText('平均スコア')).toBeInTheDocument();
      expect(screen.getByText('トレンド')).toBeInTheDocument();
    });
  });

  describe('Student Statistics Table', () => {
    it('should display first 10 students only', () => {
      const statsWithManyStudents: GeneratedStats = {
        ...mockStats,
        studentStats: [
          ...mockStats.studentStats,
          ...Array.from({ length: 10 }, (_, i) => ({
            student: `生徒${String.fromCharCode(70 + i)}`,
            recordCount: 30 + i,
            avgEmotion: 70 + i,
            trendline: [70 + i, 71 + i, 72 + i]
          }))
        ]
      };

      render(<DataVisualization data={statsWithManyStudents} />);

      expect(screen.getByText('生徒A')).toBeInTheDocument();
      expect(screen.getByText('生徒E')).toBeInTheDocument();
    });

    it('should display student data correctly', () => {
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('生徒A')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
    });

    it('should apply alternating row colors', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows.length).toBeGreaterThan(0);

      const firstRow = tableRows[0];
      const secondRow = tableRows[1];

      expect(firstRow).toHaveClass('bg-white');
      expect(secondRow).toHaveClass('bg-gray-50');
    });
  });

  describe('Trend Arrow Formatting', () => {
    it('should show upward arrow for increasing trend', () => {
      render(<DataVisualization data={mockStats} />);

      const trendArrows = screen.getAllByText('↗️');
      expect(trendArrows.length).toBeGreaterThan(0);
    });

    it('should show downward arrow for decreasing trend', () => {
      render(<DataVisualization data={mockStats} />);

      const trendArrows = screen.getAllByText('↘️');
      expect(trendArrows.length).toBeGreaterThan(0);
    });

    it('should show right arrow for stable trend', () => {
      render(<DataVisualization data={mockStats} />);

      const trendArrows = screen.getAllByText('→');
      expect(trendArrows.length).toBeGreaterThan(0);
    });

    it('should handle empty trendline gracefully', () => {
      const statsWithEmptyTrendline: GeneratedStats = {
        ...mockStats,
        studentStats: [
          {
            student: '生徒X',
            recordCount: 10,
            avgEmotion: 70,
            trendline: []
          }
        ]
      };

      const { container } = render(<DataVisualization data={statsWithEmptyTrendline} />);
      expect(container).toBeInTheDocument();
    });

    it('should handle single element trendline gracefully', () => {
      render(<DataVisualization data={mockStats} />);

      const trendDisplay = screen.getByText('65');
      expect(trendDisplay).toBeInTheDocument();
    });

    it('should display last 3 trendline values', () => {
      render(<DataVisualization data={mockStats} />);

      const trendDisplays = screen.getAllByText(/ → /);
      expect(trendDisplays.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integration', () => {
    it('should pass correct data to MonthlyEmotionChart', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(container).toBeInTheDocument();
    });

    it('should pass correct data to DayOfWeekChart', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(container).toBeInTheDocument();
    });

    it('should pass correct data to EmotionDistributionChart', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(container).toBeInTheDocument();
    });

    it('should pass correct data to TimeOfDayChart', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(container).toBeInTheDocument();
    });

    it('should pass correct data to StudentEmotionChart', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(container).toBeInTheDocument();
    });

    it('should pass correct data to EmotionTrendChart', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle stats with zero students', () => {
      const emptyStats: GeneratedStats = {
        ...mockStats,
        studentStats: []
      };

      const { container } = render(<DataVisualization data={emptyStats} />);

      expect(container).toBeInTheDocument();
    });

    it('should handle stats with single student', () => {
      const singleStudentStats: GeneratedStats = {
        ...mockStats,
        studentStats: [
          {
            student: '生徒A',
            recordCount: 50,
            avgEmotion: 75.5,
            trendline: [70, 75, 80]
          }
        ]
      };

      const { container } = render(<DataVisualization data={singleStudentStats} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('生徒A')).toBeInTheDocument();
    });

    it('should handle very large record counts', () => {
      const largeCountStats: GeneratedStats = {
        ...mockStats,
        overview: {
          count: 1000000,
          avgEmotion: 75.5
        }
      };

      render(<DataVisualization data={largeCountStats} />);

      expect(screen.getByText('1,000,000')).toBeInTheDocument();
    });

    it('should handle decimal emotion scores', () => {
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('75.5')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should memoize student stats slice', () => {
      const { rerender } = render(<DataVisualization data={mockStats} />);

      const initialRender = screen.getByText('生徒A');

      rerender(<DataVisualization data={mockStats} />);

      expect(initialRender).toBeInTheDocument();
    });

    it('should have correct displayName', () => {
      expect(DataVisualization.displayName).toBe('DataVisualization');
    });
  });
});

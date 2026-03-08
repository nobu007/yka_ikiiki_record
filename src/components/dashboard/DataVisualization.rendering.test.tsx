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

describe('DataVisualization Rendering', () => {
  describe('Overview Statistics', () => {
    it('should render overview statistics correctly', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('データ概要')).toBeInTheDocument();
      expect(screen.getByText('総記録数')).toBeInTheDocument();
      expect(screen.getByText('平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();

      const textContent = container.textContent;
      expect(textContent).toContain('75.5');
    });
  });

  describe('Chart Sections', () => {
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

  describe('Data Display', () => {
    it('should display student names correctly', () => {
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('生徒A')).toBeInTheDocument();
      expect(screen.getByText('生徒B')).toBeInTheDocument();
      expect(screen.getByText('生徒C')).toBeInTheDocument();
      expect(screen.getByText('生徒D')).toBeInTheDocument();
      expect(screen.getByText('生徒E')).toBeInTheDocument();
    });

    it('should display record counts correctly', () => {
      render(<DataVisualization data={mockStats} />);

      const textContent = screen.getByText('詳細統計').parentElement?.textContent || '';
      expect(textContent).toContain('50');
      expect(textContent).toContain('45');
      expect(textContent).toContain('60');
      expect(textContent).toContain('40');
      expect(textContent).toContain('55');
    });

    it('should display average scores correctly', () => {
      render(<DataVisualization data={mockStats} />);

      const textContent = screen.getByText('詳細統計').parentElement?.textContent || '';
      expect(textContent).toContain('75.5');
      expect(textContent).toContain('72.3');
      expect(textContent).toContain('78.9');
      expect(textContent).toContain('69.2');
      expect(textContent).toContain('76.8');
    });
  });
});

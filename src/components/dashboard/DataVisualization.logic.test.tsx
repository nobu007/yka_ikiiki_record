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

describe('DataVisualization Logic', () => {
  describe('Student Statistics Table', () => {
    it('should render all student statistics', () => {
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('生徒A')).toBeInTheDocument();
      expect(screen.getByText('生徒B')).toBeInTheDocument();
      expect(screen.getByText('生徒C')).toBeInTheDocument();
      expect(screen.getByText('生徒D')).toBeInTheDocument();
      expect(screen.getByText('生徒E')).toBeInTheDocument();
    });

    it('should display record counts for all students', () => {
      render(<DataVisualization data={mockStats} />);

      const container = screen.getByText('詳細統計').parentElement;
      expect(container?.textContent).toContain('50');
      expect(container?.textContent).toContain('45');
      expect(container?.textContent).toContain('60');
      expect(container?.textContent).toContain('40');
      expect(container?.textContent).toContain('55');
    });

    it('should display average scores for all students', () => {
      render(<DataVisualization data={mockStats} />);

      const container = screen.getByText('詳細統計').parentElement;
      expect(container?.textContent).toContain('75.5');
      expect(container?.textContent).toContain('72.3');
      expect(container?.textContent).toContain('78.9');
      expect(container?.textContent).toContain('69.2');
      expect(container?.textContent).toContain('76.8');
    });
  });

  describe('Trend Arrow Formatting', () => {
    it('should render upward trend arrow for increasing trendlines', () => {
      render(<DataVisualization data={mockStats} />);

      const studentARow = screen.getByText('生徒A').closest('tr');
      expect(studentARow?.textContent).toContain('↗');
    });

    it('should render downward trend arrow for decreasing trendlines', () => {
      render(<DataVisualization data={mockStats} />);

      const studentBRow = screen.getByText('生徒B').closest('tr');
      expect(studentBRow?.textContent).toContain('↘');
    });

    it('should render stable trend arrow for constant trendlines', () => {
      render(<DataVisualization data={mockStats} />);

      const studentCRow = screen.getByText('生徒C').closest('tr');
      expect(studentCRow?.textContent).toContain('→');
    });

    it('should render neutral arrow for single data point', () => {
      render(<DataVisualization data={mockStats} />);

      const studentDRow = screen.getByText('生徒D').closest('tr');
      expect(studentDRow?.textContent).not.toContain('↗');
      expect(studentDRow?.textContent).not.toContain('↘');
      expect(studentDRow?.textContent).not.toContain('→');
    });

    it('should render upward trend for volatile increasing trendlines', () => {
      render(<DataVisualization data={mockStats} />);

      const studentERow = screen.getByText('生徒E').closest('tr');
      expect(studentERow?.textContent).toContain('↗');
    });
  });

  describe('Data Integration', () => {
    it('should integrate overview stats correctly', () => {
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(container.textContent).toContain('1,000');
      expect(container.textContent).toContain('75.5');
    });

    it('should integrate chart data correctly', () => {
      render(<DataVisualization data={mockStats} />);

      const sections = screen.getAllByRole('generic');
      const chartSections = sections.filter(section => {
        const classes = section.className;
        return classes && classes.includes('bg-white rounded-lg p-6 shadow-sm');
      });

      expect(chartSections.length).toBeGreaterThan(0);
    });

    it('should pass correct props to child components', () => {
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText('データ概要')).toBeInTheDocument();
      expect(screen.getByText('詳細統計')).toBeInTheDocument();
    });
  });
});

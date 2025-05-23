import { render, screen } from '@testing-library/react';
import DynamicBarChart from '../DynamicBarChart';

jest.mock('next/dynamic', () => () => {
  const MockChart = () => <div data-testid="mock-chart" />;
  return MockChart;
});

describe('DynamicBarChart', () => {
  const mockData = [
    { name: '1月', value: 3.5 },
    { name: '2月', value: 4.2 },
  ];

  it('renders loading state initially', () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders chart with title in light mode', () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
        title="テストチャート"
      />
    );
    expect(screen.getByText('テストチャート')).toHaveClass('text-gray-900');
  });

  it('renders chart with title in dark mode', () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
        title="テストチャート"
        isDark
      />
    );
    expect(screen.getByText('テストチャート')).toHaveClass('text-gray-100');
  });

  it('renders without title', () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
      />
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
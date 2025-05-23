import { render, screen } from '@testing-library/react';
import DynamicBarChart from '../DynamicBarChart';

describe('DynamicBarChart', () => {
  const mockData = [
    { name: '1月', value: 3.5 },
    { name: '2月', value: 4.2 },
  ];

  it('renders chart with title', () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
        title="テストチャート"
      />
    );
    expect(screen.getByText('テストチャート')).toBeInTheDocument();
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
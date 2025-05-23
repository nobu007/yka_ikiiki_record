import { render, screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DynamicBarChart, { ChartData } from '../DynamicBarChart';
import { useTheme } from 'next-themes';
import { ApexOptions } from 'apexcharts'; // ApexOptionsのみをインポート

expect.extend(toHaveNoViolations);

// ApexChartsのシリーズ型の定義を取得
type ApexChartSeries = ApexOptions['series'];

// モックの設定
jest.mock('next/dynamic', () => () => {
  // optionsとseriesの型を修正
  const DynamicComponent = ({ options, series }: { options: ApexOptions; series: ApexChartSeries }) => (
    <div data-testid="mock-chart" data-options={JSON.stringify(options)} data-series={JSON.stringify(series)}>
      Mock Chart
    </div>
  );
  DynamicComponent.displayName = 'MockChart';
  return DynamicComponent;
});

// next-themesのuseThemeをモック
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('DynamicBarChart', () => {
  const mockData: ChartData[] = [
    { name: '1月', value: 3.5 },
    { name: '2月', value: 4.2 },
    { name: '3月', value: 3.8 },
    { name: '4月', value: 4.5 },
    { name: '5月', value: 3.1 },
    { name: '6月', value: 4.0 },
    { name: '7月', value: 3.9 },
    { name: '8月', value: 4.1 },
    { name: '9月', value: 3.7 },
    { name: '10月', value: 4.3 },
    { name: '11月', value: 3.6 },
    { name: '12月', value: 4.4 },
  ];

  // 各テストの前にuseThemeのモックをリセット
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'light' });
    jest.useFakeTimers(); // タイマーをモック
  });

  afterEach(() => {
    jest.useRealTimers(); // タイマーを元に戻す
  });

  it('renders loading state initially', () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
      />
    );
    // next/dynamicのloadingコンポーネントが表示されることを確認
    expect(screen.getByRole('status', { name: 'グラフローディング中' })).toBeInTheDocument();
  });

  it('renders chart after mounting', async () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
      />
    );

    // useEffectのmounted stateがtrueになるのを待つ
    await act(async () => {
      jest.advanceTimersByTime(0); // useEffect内のsetStateをトリガー
    });

    // モックされたチャートコンポーネントが表示されることを確認
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });


  it('meets accessibility guidelines', async () => {
    const { container } = render(
      <DynamicBarChart
        height={300}
        data={mockData}
        title="テストチャート"
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('handles empty data gracefully', async () => {
    render(
      <DynamicBarChart
        height={300}
        data={[]}
        title="空のチャート"
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'データなし' })).toBeInTheDocument();
  });

  it('applies correct theme based on isDark prop', async () => {
    const { rerender } = render(
      <DynamicBarChart
        height={300}
        data={mockData}
        isDark={false}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    let mockChart = screen.getByTestId('mock-chart');
    let options = JSON.parse(mockChart.dataset.options || '{}');
    expect(options.chart.background).toBe('#ffffff');

    rerender(
      <DynamicBarChart
        height={300}
        data={mockData}
        isDark={true}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    mockChart = screen.getByTestId('mock-chart');
    options = JSON.parse(mockChart.dataset.options || '{}');
    expect(options.chart.background).toBe('#1f2937');
  });

  it('renders without title', async () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('passes correct data and options to ReactApexChart', async () => {
    render(
      <DynamicBarChart
        height={300}
        data={mockData}
        title="テストチャート"
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    const mockChart = screen.getByTestId('mock-chart');
    const options = JSON.parse(mockChart.dataset.options || '{}');
    const series = JSON.parse(mockChart.dataset.series || '{}');

    expect(options.xaxis.categories).toEqual(mockData.map(d => d.name));
    expect(series[0].data).toEqual(mockData.map(d => d.value));
    expect(options.chart.height).toBe(300);
    expect(options.tooltip.y.formatter(3.14159)).toBe('3.14'); // formatterテスト
  });

  it('shows error message if data processing fails', async () => {
    // 不正なデータを含む配列
    const invalidData = [...mockData, { name: 'Invalid', value: 'not a number' }];

    render(
      <DynamicBarChart
        height={300}
        data={invalidData as ChartData[]} // 型アサーションを使用
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    // エラーメッセージが表示されることを確認
    expect(screen.getByText('グラフの表示中にエラーが発生しました')).toBeInTheDocument();
    expect(screen.getByRole('alert', { name: 'グラフエラー' })).toBeInTheDocument();
  });

  it('debounces rapid data updates', async () => {
    const { rerender } = render(
      <DynamicBarChart
        height={300}
        data={mockData}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    const initialOptions = JSON.parse(screen.getByTestId('mock-chart').dataset.options || '{}');

    // 複数回の更新を短時間で行う
    for (let i = 0; i < 5; i++) {
      rerender(
        <DynamicBarChart
          height={300}
          data={[...mockData, { name: `新データ${i}`, value: i + 1 }]}
        />
      );
    }

    // debounceの待機時間未満ではチャートが更新されないことを確認
    act(() => {
      jest.advanceTimersByTime(200); // debounce時間(250ms)未満
    });
    let currentOptions = JSON.parse(screen.getByTestId('mock-chart').dataset.options || '{}');
    expect(currentOptions).toEqual(initialOptions); // オプションが変わっていない

    // debounceの待機時間経過後、チャートが更新されることを確認
    act(() => {
      jest.advanceTimersByTime(50); // 合計250ms
    });
    currentOptions = JSON.parse(screen.getByTestId('mock-chart').dataset.options || '{}');
    expect(currentOptions).not.toEqual(initialOptions); // オプションが変わっている
    expect(currentOptions.xaxis.categories.length).toBe(mockData.length + 5); // データが追加されている
  });
});
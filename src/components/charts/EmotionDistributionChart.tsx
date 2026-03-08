import React, { useMemo } from 'react';
import { EmotionChart } from './EmotionChart';

export const EmotionDistributionChart = React.memo<{ data: number[] }>(({ data }) => {
  const labels = ['1', '2', '3', '4', '5'];
  const chartData = useMemo(() => ({
    labels,
    series: [{
      name: '分布',
      data
    }]
  }), [labels, data]);

  return (
    <EmotionChart
      data={chartData}
      title="感情スコア分布"
      type="bar"
      height={250}
    />
  );
});

EmotionDistributionChart.displayName = 'EmotionDistributionChart';

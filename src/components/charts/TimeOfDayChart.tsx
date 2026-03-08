import React, { useMemo } from 'react';
import { EmotionChart } from './EmotionChart';

export const TimeOfDayChart = React.memo<{ data: { morning: number; afternoon: number; evening: number } }>(({ data }) => {
  const chartData = useMemo(() => ({
    labels: ['朝', '昼', '夜'],
    series: [{
      name: '平均感情スコア',
      data: [data.morning, data.afternoon, data.evening]
    }]
  }), [data]);

  return (
    <EmotionChart
      data={chartData}
      title="時間帯別感情スコア"
      type="bar"
      height={250}
    />
  );
});

TimeOfDayChart.displayName = 'TimeOfDayChart';

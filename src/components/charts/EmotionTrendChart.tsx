import React, { useMemo } from 'react';
import { EmotionChart } from './EmotionChart';

// Define chart constants to avoid magic numbers
const EMOTION_TREND_CHART_HEIGHT = 350;

export const EmotionTrendChart = React.memo<{ data: Array<{ student: string; trendline: number[] }> }>(({ data }) => {
  const chartData = useMemo(() => ({
    labels: ['7日前', '6日前', '5日前', '4日前', '3日前', '2日前', '1日前'],
    series: data.slice(0, 5).map(student => ({
      name: student.student,
      data: student.trendline
    }))
  }), [data]);

  return (
    <EmotionChart
      data={chartData}
      title="感情スコア推移（上位5名）"
      type="line"
      height={EMOTION_TREND_CHART_HEIGHT}
    />
  );
});

EmotionTrendChart.displayName = 'EmotionTrendChart';

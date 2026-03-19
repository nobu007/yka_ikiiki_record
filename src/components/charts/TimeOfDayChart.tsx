import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";
import { CHART_TITLES, CHART_AXIS_LABELS } from "@/lib/constants/messages";
import { UI_CONSTANTS } from "@/lib/constants/ui";

export const TimeOfDayChart = memo<{
  data: { morning: number; afternoon: number; evening: number };
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: CHART_AXIS_LABELS.TIME_OF_DAY,
      series: [
        {
          name: CHART_TITLES.AVERAGE_EMOTION_SCORE,
          data: [data.morning, data.afternoon, data.evening],
        },
      ],
    }),
    [data],
  );

  return (
    <EmotionChart
      data={chartData}
      title={CHART_TITLES.TIME_OF_DAY_AVERAGE_EMOTION}
      type="bar"
      height={UI_CONSTANTS.CHART.HEIGHT.SMALL}
    />
  );
});

TimeOfDayChart.displayName = "TimeOfDayChart";

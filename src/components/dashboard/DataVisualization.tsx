import { useMemo, useCallback, memo } from "react";
import {
  MonthlyEmotionChart,
  DayOfWeekChart,
  EmotionDistributionChart,
  TimeOfDayChart,
  StudentEmotionChart,
  EmotionTrendChart,
} from "@/components/charts";
import { ExportButton } from "@/components/common";
import { StatsData } from "@/schemas/api";
import { CHART_TITLES } from "@/lib/constants/messages";

/**
 * Maximum number of students to display in the table.
 */
const MAX_STUDENTS_IN_TABLE = 10;

/**
 * Modulo value for alternating row background colors.
 */
const ALTERNATING_ROW_MODULO = 2;

/**
 * Number of recent data points to use for trend calculation.
 */
const RECENT_TREND_POINTS = 3;

/**
 * Props for DataVisualization component.
 */
interface DataVisualizationProps {
  /** Statistics data containing all visualization datasets */
  data: StatsData;
}

/**
 * Comprehensive data visualization dashboard for emotion statistics.
 *
 * This component renders a complete dashboard with multiple chart types and
 * statistical displays. It organizes data into a responsive grid layout with
 * overview statistics, trend charts, distribution charts, and student-specific data.
 *
 * **Visualization Sections:**
 * 1. **Overview Statistics**: Total records and average emotion score
 * 2. **Monthly Trends**: Emotion patterns over time by month
 * 3. **Day of Week Analysis**: Patterns by day of week
 * 4. **Emotion Distribution**: Breakdown by emotion category
 * 5. **Time of Day Analysis**: Patterns throughout the day
 * 6. **Student Statistics**: Individual student data with trend indicators
 * 7. **Recent Trends**: Line chart showing recent emotion changes
 *
 * **Features:**
 * - Responsive grid layout (1 column mobile, 2 columns desktop)
 * - Trend arrows (↗️ ↘️ →) showing direction of change
 * - Limited student table to top 10 for performance
 * - Memoized computations for performance optimization
 * - Color-coded statistics cards for visual hierarchy
 *
 * @example
 * ```tsx
 * import { useStats } from '@/presentation/hooks/useStats';
 *
 * function DashboardPage() {
 *   const { stats, isLoading, error } = useStats();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage />;
 *
 *   return <DataVisualization data={stats} />;
 * }
 * ```
 */
export const DataVisualization = memo<DataVisualizationProps>(({ data }) => {
  const formatTrendArrow = useCallback((trendline: number[]) => {
    if (trendline.length < 2) return "";
    const last = trendline[trendline.length - 1];
    const prev = trendline[trendline.length - 2];
    if (last === undefined || prev === undefined) return "";
    return last > prev ? "↗️" : last < prev ? "↘️" : "→";
  }, []);

  const studentStatsSlice = useMemo(
    () => data.studentStats.slice(0, MAX_STUDENTS_IN_TABLE),
    [data.studentStats],
  );
  return (
    <div className="space-y-8">
      {/* Overview Statistics */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {CHART_TITLES.DATA_OVERVIEW}
          </h2>
          <div className="flex gap-2">
            <ExportButton format="csv" />
            <ExportButton format="xlsx" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              {CHART_TITLES.TOTAL_RECORDS}
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {data.overview.count.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-900 mb-1">
              {CHART_TITLES.AVERAGE_EMOTION_SCORE}
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {data.overview.avgEmotion}
            </p>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <MonthlyEmotionChart data={data.monthlyStats} />
        </section>

        {/* Day of Week Analysis */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <DayOfWeekChart data={data.dayOfWeekStats} />
        </section>

        {/* Emotion Distribution */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <EmotionDistributionChart data={data.emotionDistribution} />
        </section>

        {/* Time of Day Analysis */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <TimeOfDayChart data={data.timeOfDayStats} />
        </section>
      </div>

      {/* Student Analysis */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <StudentEmotionChart data={data.studentStats} />
      </section>

      {/* Trend Analysis */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <EmotionTrendChart data={data.studentStats} />
      </section>

      {/* Detailed Statistics Table */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">詳細統計</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  生徒
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  記録数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平均スコア
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  トレンド
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentStatsSlice.map((student, index) => (
                <tr
                  key={student.student}
                  className={
                    index % ALTERNATING_ROW_MODULO === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.student}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.recordCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.avgEmotion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {formatTrendArrow(student.trendline)}
                      </span>
                      <span className="text-xs">
                        {student.trendline
                          .slice(-RECENT_TREND_POINTS)
                          .join(" → ")}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
});

DataVisualization.displayName = "DataVisualization";

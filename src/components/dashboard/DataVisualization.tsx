// Data visualization component for displaying charts and statistics

import React from 'react';
import { 
  MonthlyEmotionChart,
  DayOfWeekChart,
  EmotionDistributionChart,
  TimeOfDayChart,
  StudentEmotionChart,
  EmotionTrendChart
} from '@/components/charts';
import { GeneratedStats } from '@/infrastructure/services/dataService';

interface DataVisualizationProps {
  data: GeneratedStats;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Overview Statistics */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">データ概要</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-1">総記録数</h3>
            <p className="text-2xl font-bold text-blue-600">{data.overview.count.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-900 mb-1">平均感情スコア</h3>
            <p className="text-2xl font-bold text-green-600">{data.overview.avgEmotion}</p>
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
              {data.studentStats.slice(0, 10).map((student, index) => (
                <tr key={student.student} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
                        {student.trendline.length >= 2 && (
                          student.trendline[student.trendline.length - 1] > student.trendline[student.trendline.length - 2] ? '↗️' : 
                          student.trendline[student.trendline.length - 1] < student.trendline[student.trendline.length - 2] ? '↘️' : '→'
                        )}
                      </span>
                      <span className="text-xs">
                        {student.trendline.slice(-3).join(' → ')}
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
};
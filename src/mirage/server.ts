import { createServer, Factory, Model, Response } from 'miragejs';
import { Stats } from '@/types/stats';

type Record = {
  emotion: number;
  date: string;
  student: string;
  comment: string;
};

export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,

    models: {
      record: Model.extend<Partial<Record>>({}),
    },

    factories: {
      record: Factory.extend({
        emotion() {
          return 1 + Math.random() * 4; // 1-5のランダムな感情スコア
        },
        date() {
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 365));
          return date.toISOString().split('T')[0];
        },
        student() {
          return `学生${Math.floor(Math.random() * 25) + 1}`;
        },
        comment() {
          return 'テストコメント';
        },
      }),
    },

    seeds() {
      // 初期データはシードAPIで生成するため、ここでは空にしています
    },

    routes() {
      this.namespace = 'api';

      this.post('/seed', function (schema) {
        // 既存のデータをクリア
        schema.db.emptyData();

        // 新しいデータを生成（25名×30日分）
        Array.from({ length: 750 }).forEach(() => {
          schema.create('record', {});
        });

        return new Response(200, {}, { message: 'Data seeded successfully' });
      });

      this.get('/stats', (schema) => {
        const records = schema.all('record').models as Record[];

        // 基本的な統計データの準備
        const monthlyData = new Map<string, { sum: number; count: number }>();
        const studentData = new Map<string, number[]>();
        const dayOfWeekData = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
        const timeOfDayData = {
          morning: { sum: 0, count: 0 },   // 5-11時
          afternoon: { sum: 0, count: 0 }, // 12-17時
          evening: { sum: 0, count: 0 }    // 18-4時
        };

        // データの集計
        let totalEmotion = 0;
        records.forEach(record => {
          const date = new Date(record.date);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          // 月別データ
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { sum: 0, count: 0 });
          }
          const monthData = monthlyData.get(month)!;
          monthData.sum += record.emotion;
          monthData.count += 1;

          // 学生別データ
          if (!studentData.has(record.student)) {
            studentData.set(record.student, []);
          }
          studentData.get(record.student)!.push(record.emotion);

          // 曜日別データ
          const dayOfWeek = date.getDay();
          dayOfWeekData[dayOfWeek].sum += record.emotion;
          dayOfWeekData[dayOfWeek].count += 1;

          // 時間帯別データ
          const hour = date.getHours();
          if (hour >= 5 && hour < 12) {
            timeOfDayData.morning.sum += record.emotion;
            timeOfDayData.morning.count += 1;
          } else if (hour >= 12 && hour < 18) {
            timeOfDayData.afternoon.sum += record.emotion;
            timeOfDayData.afternoon.count += 1;
          } else {
            timeOfDayData.evening.sum += record.emotion;
            timeOfDayData.evening.count += 1;
          }

          totalEmotion += record.emotion;
        });

        // 統計データの整形
        const stats: Stats = {
          overview: {
            count: records.length,
            avgEmotion: (totalEmotion / records.length).toFixed(2)
          },
          monthlyStats: Array.from(monthlyData.entries())
            .map(([month, data]) => ({
              month,
              count: data.count,
              avgEmotion: (data.sum / data.count).toFixed(2)
            }))
            .sort((a, b) => b.month.localeCompare(a.month)),
          studentStats: Array.from(studentData.entries())
            .map(([student, emotions]) => ({
              student,
              recordCount: emotions.length,
              avgEmotion: (emotions.reduce((sum, e) => sum + e, 0) / emotions.length).toFixed(2),
              trendline: emotions.slice(-7)
            }))
            .sort((a, b) => Number(b.avgEmotion) - Number(a.avgEmotion)),
          dayOfWeekStats: ['日', '月', '火', '水', '木', '金', '土']
            .map((day, index) => ({
              day,
              avgEmotion: dayOfWeekData[index].count > 0
                ? (dayOfWeekData[index].sum / dayOfWeekData[index].count).toFixed(2)
                : '0.00',
              count: dayOfWeekData[index].count
            })),
          emotionDistribution: records
            .reduce((acc, record) => {
              const index = Math.floor(record.emotion) - 1;
              acc[index]++;
              return acc;
            }, new Array(5).fill(0)),
          timeOfDayStats: {
            morning: timeOfDayData.morning.count > 0
              ? (timeOfDayData.morning.sum / timeOfDayData.morning.count).toFixed(2)
              : '0.00',
            afternoon: timeOfDayData.afternoon.count > 0
              ? (timeOfDayData.afternoon.sum / timeOfDayData.afternoon.count).toFixed(2)
              : '0.00',
            evening: timeOfDayData.evening.count > 0
              ? (timeOfDayData.evening.sum / timeOfDayData.evening.count).toFixed(2)
              : '0.00'
          }
        };

        return stats;
      });
    },
  });
}
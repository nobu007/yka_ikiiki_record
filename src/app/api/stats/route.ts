import { NextResponse } from 'next/server';
import { ensureServer } from '@/mirage';

// レコードの型定義
interface Record {
  attrs: {
    emotion: number;
    date: string;
    student: string;
    comment: string;
  };
}

/** App Router ではキャッシュを防ぐため */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // モックモードの場合のみMirageJSを使用
    if (process.env.NEXT_PUBLIC_MOCK === "true") {
      const server = ensureServer();
      const mockRecords = server.schema.all('record').models as Record[];

      if (!mockRecords || !Array.isArray(mockRecords)) {
        return NextResponse.json(
          { count: 0, avgEmotion: "0.00", error: 'No records found' },
          { status: 200 }
        );
      }

      // 基本的な統計データの準備
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(1);

      // 集計用のデータ構造
      const monthlyData = new Map<string, { sum: number; count: number }>();
      const studentData = new Map<string, { emotions: number[]; dates: string[] }>();
      const dayOfWeekData = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
      const emotionDistribution = new Array(5).fill(0); // 1-5の感情値分布
      const timeOfDayData = {
        morning: { sum: 0, count: 0 },   // 5-11時
        afternoon: { sum: 0, count: 0 }, // 12-17時
        evening: { sum: 0, count: 0 }    // 18-4時
      };

      // 過去12ヶ月分の初期化
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, { sum: 0, count: 0 });
      }

      // データの集計
      mockRecords.forEach(record => {
        const { emotion, student, date: dateStr } = record.attrs;
        const date = new Date(dateStr);
        if (typeof emotion !== 'number' || isNaN(date.getTime())) {
          console.warn('Invalid record:', record);
          return;
        }

        // 月別データ
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthData = monthlyData.get(monthKey);
        if (monthData) {
          monthData.sum += emotion;
          monthData.count += 1;
        }

        // 学生別データ
        if (!studentData.has(student)) {
          studentData.set(student, { emotions: [], dates: [] });
        }
        const studentStats = studentData.get(student)!;
        studentStats.emotions.push(emotion);
        studentStats.dates.push(dateStr);

        // 曜日別データ
        const dayOfWeek = date.getDay();
        dayOfWeekData[dayOfWeek].sum += emotion;
        dayOfWeekData[dayOfWeek].count += 1;

        // 感情値の分布
        emotionDistribution[Math.floor(emotion) - 1]++;

        // 時間帯別データ
        const hour = date.getHours();
        if (hour >= 5 && hour < 12) {
          timeOfDayData.morning.sum += emotion;
          timeOfDayData.morning.count += 1;
        } else if (hour >= 12 && hour < 18) {
          timeOfDayData.afternoon.sum += emotion;
          timeOfDayData.afternoon.count += 1;
        } else {
          timeOfDayData.evening.sum += emotion;
          timeOfDayData.evening.count += 1;
        }
      });

      // 統計データの整形
      const monthlyStats = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          count: data.count,
          avgEmotion: data.count > 0 ? (data.sum / data.count).toFixed(2) : "0.00"
        }))
        .sort((a, b) => b.month.localeCompare(a.month));

      // 学生別の統計
      const studentStats = Array.from(studentData.entries())
        .map(([student, data]) => {
          const avg = data.emotions.reduce((sum, e) => sum + e, 0) / data.emotions.length;
          return {
            student,
            recordCount: data.emotions.length,
            avgEmotion: avg.toFixed(2),
            trendline: data.emotions.slice(-7) // 直近7回分のトレンド
          };
        })
        .sort((a, b) => Number(b.avgEmotion) - Number(a.avgEmotion));

      // 曜日別の平均
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayOfWeekStats = dayOfWeekData.map((data, index) => ({
        day: dayNames[index],
        avgEmotion: data.count > 0 ? (data.sum / data.count).toFixed(2) : "0.00",
        count: data.count
      }));

      // 時間帯別の平均
      const timeOfDayStats = {
        morning: timeOfDayData.morning.count > 0
          ? (timeOfDayData.morning.sum / timeOfDayData.morning.count).toFixed(2)
          : "0.00",
        afternoon: timeOfDayData.afternoon.count > 0
          ? (timeOfDayData.afternoon.sum / timeOfDayData.afternoon.count).toFixed(2)
          : "0.00",
        evening: timeOfDayData.evening.count > 0
          ? (timeOfDayData.evening.sum / timeOfDayData.evening.count).toFixed(2)
          : "0.00"
      };

      // 全体の集計
      const totalRecords = monthlyStats.reduce((sum, month) => sum + month.count, 0);
      const totalEmotion = monthlyStats.reduce((sum, month) =>
        sum + (month.count * Number(month.avgEmotion)), 0);

      return NextResponse.json({
        overview: {
          count: totalRecords,
          avgEmotion: totalRecords > 0 ? (totalEmotion / totalRecords).toFixed(2) : "0.00"
        },
        monthlyStats,
        studentStats,
        dayOfWeekStats,
        emotionDistribution,
        timeOfDayStats
      }, { status: 200 });
    }

    // 本番環境では実際のデータベースからデータを取得
    // TODO: 本番環境用のデータベースクライアントを実装する
    return NextResponse.json(
      { error: 'Production database not implemented' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

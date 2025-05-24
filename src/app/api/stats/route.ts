import { StatsResponseSchema } from '@/schemas/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 統計データを取得するロジック（例：DBから取得など）
    const rawStats = {
      overview: {
        count: 100,
        avgEmotion: 3.5
      },
      monthlyStats: [
        { month: '2025-04', avgEmotion: 3.2, count: 45 },
        { month: '2025-05', avgEmotion: 3.8, count: 55 }
      ],
      studentStats: [
        {
          student: '学生A',
          recordCount: 30,
          avgEmotion: 3.5,
          trendline: [3.2, 3.4, 3.6, 3.5, 3.7, 3.8, 3.9]
        },
        {
          student: '学生B',
          recordCount: 25,
          avgEmotion: 3.8,
          trendline: [3.5, 3.6, 3.8, 3.7, 3.9, 4.0, 3.8]
        }
      ],
      dayOfWeekStats: [
        { day: '月', avgEmotion: 3.1, count: 15 },
        { day: '火', avgEmotion: 3.3, count: 12 },
        { day: '水', avgEmotion: 3.5, count: 18 },
        { day: '木', avgEmotion: 3.7, count: 14 },
        { day: '金', avgEmotion: 3.9, count: 16 },
        { day: '土', avgEmotion: 4.1, count: 13 },
        { day: '日', avgEmotion: 3.8, count: 12 }
      ],
      emotionDistribution: [5, 15, 35, 30, 15],
      timeOfDayStats: {
        morning: 3.6,
        afternoon: 3.8,
        evening: 3.4
      }
    };

    // スキーマによる検証
    const validatedStats = StatsResponseSchema.parse(rawStats);

    return NextResponse.json(validatedStats);
  } catch (error) {
    console.error('統計データの取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

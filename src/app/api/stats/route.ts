import { StatsResponseSchema } from '@/schemas/stats';
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
        { month: '2025-04', avgEmotion: 3.2 },
        { month: '2025-05', avgEmotion: 3.8 }
      ],
      dayOfWeekStats: [
        { day: '月', avgEmotion: 3.1 },
        { day: '火', avgEmotion: 3.3 },
        { day: '水', avgEmotion: 3.5 },
        { day: '木', avgEmotion: 3.7 },
        { day: '金', avgEmotion: 3.9 },
        { day: '土', avgEmotion: 4.1 },
        { day: '日', avgEmotion: 3.8 }
      ],
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

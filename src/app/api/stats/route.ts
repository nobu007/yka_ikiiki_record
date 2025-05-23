import { NextResponse } from 'next/server';
import { StatsResponseSchema } from '@/types/api';

export async function GET() {
  try {
    // 実際のデータ取得ロジックはここに実装
    // この例ではモックデータを返します
    const mockData = {
      overview: {
        count: 100,
        avgEmotion: 7.5
      },
      monthlyStats: [
        { month: '2025-04', avgEmotion: 7.2 },
        { month: '2025-05', avgEmotion: 7.8 }
      ],
      dayOfWeekStats: [
        { day: '月', avgEmotion: 7.1 },
        { day: '火', avgEmotion: 7.3 },
        { day: '水', avgEmotion: 7.5 },
        { day: '木', avgEmotion: 7.7 },
        { day: '金', avgEmotion: 7.9 },
        { day: '土', avgEmotion: 8.1 },
        { day: '日', avgEmotion: 7.8 }
      ],
      timeOfDayStats: {
        morning: 7.6,
        afternoon: 7.8,
        evening: 7.4
      }
    };

    // Zodでバリデーション
    const validatedData = StatsResponseSchema.parse(mockData);

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

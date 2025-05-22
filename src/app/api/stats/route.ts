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

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(1); // 月初に設定

      // 過去12ヶ月分の月データを初期化
      const monthlyData = new Map<string, { sum: number; count: number }>();
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, { sum: 0, count: 0 });
      }

      // データの集計
      mockRecords.forEach(record => {
        const emotion = record.attrs?.emotion;
        const date = new Date(record.attrs?.date);
        if (typeof emotion !== 'number' || isNaN(date.getTime())) {
          console.warn('Invalid record:', record);
          return;
        }

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthData = monthlyData.get(monthKey);
        if (monthData) {
          monthData.sum += emotion;
          monthData.count += 1;
        }
      });

      // 月別平均の計算
      const monthlyStats = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          count: data.count,
          avgEmotion: data.count > 0 ? (data.sum / data.count).toFixed(2) : "0.00"
        }))
        .sort((a, b) => b.month.localeCompare(a.month)); // 新しい月順

      // 全体の平均を計算
      const totalData = monthlyStats.reduce(
        (acc, curr) => {
          const count = Number(curr.count);
          const sum = count * Number(curr.avgEmotion);
          return {
            count: acc.count + count,
            sum: acc.sum + sum
          };
        },
        { count: 0, sum: 0 }
      );

      return NextResponse.json({
        count: totalData.count,
        avgEmotion: totalData.count > 0 ? (totalData.sum / totalData.count).toFixed(2) : "0.00",
        monthlyStats
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

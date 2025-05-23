import { NextResponse } from 'next/server';
import { ensureServer } from '@/mirage';

// レコードの型定義
interface StatRecord {
  attrs: {
    id: number;
    date: string;
    value: number;
  };
}

/** App Router ではキャッシュを防ぐため */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_MOCK !== "true") {
      return NextResponse.json(
        { error: 'Mock mode is not enabled' },
        { status: 400 }
      );
    }

    const server = ensureServer();
    if (!server) {
      return NextResponse.json(
        { error: 'Failed to initialize mock server' },
        { status: 500 }
      );
    }

    const stats = server.schema.all('stat').models as StatRecord[];
    if (!stats || !Array.isArray(stats)) {
      return NextResponse.json(
        { error: 'No stats found' },
        { status: 200 }
      );
    }

    // 日付でソートされたデータを返す
    const sortedStats = stats
      .map(stat => ({
        date: stat.attrs.date,
        value: stat.attrs.value
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(sortedStats, { status: 200 });

  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

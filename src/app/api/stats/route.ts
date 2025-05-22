import { NextResponse } from 'next/server';

// レコードの型定義
interface Record {
  emotion: number;
}

/** App Router ではキャッシュを防ぐため */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // モックモードの場合のみMirageJSを使用
    if (process.env.NEXT_PUBLIC_MOCK === "true") {
      if (!globalThis.server?.schema) {
        return NextResponse.json(
          { count: 0, avg: 0, error: 'Mock server not initialized' },
          { status: 200 }
        );
      }

      const mockRecords = globalThis.server.schema.all('record').models as Record[];

      if (!mockRecords || !Array.isArray(mockRecords)) {
        return NextResponse.json(
          { count: 0, avg: 0, error: 'No records found' },
          { status: 200 }
        );
      }

      const count = mockRecords.length;
      if (count === 0) {
        return NextResponse.json({ count: 0, avg: 0 }, { status: 200 });
      }

      const avg = mockRecords.reduce((sum, record) => sum + record.emotion, 0) / count;
      return NextResponse.json({ count, avg }, { status: 200 });
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

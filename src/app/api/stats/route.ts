import { NextResponse } from 'next/server';

// レコードの型定義
interface Record {
  emotion: number;
}

export async function GET() {
  try {
    // 開発環境とテスト環境ではMirageJSを使用
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      if (!globalThis.server?.schema) {
        return NextResponse.json(
          { count: 0, avg: 0, error: 'Development server not initialized' },
          { status: 200 }
        );
      }

      const mockRecords = globalThis.server.schema.all('record').models as Record[];

      if (!mockRecords || !Array.isArray(mockRecords)) {
        return NextResponse.json(
          { count: 0, avg: 0, error: 'No mock records found' },
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
    // 例: const records = await prisma.records.findMany();
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

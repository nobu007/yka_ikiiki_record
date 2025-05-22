import { NextResponse } from 'next/server';

// レコードの型定義
interface Record {
  emotion: number;
}

export async function GET() {
  try {
    // サーバーとレコードの存在チェック
    if (!globalThis.server?.schema) {
      return NextResponse.json(
        { count: 0, avg: 0, error: 'Server not initialized' },
        { status: 200 }
      );
    }

    const records = globalThis.server.schema.all('record').models as Record[];

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { count: 0, avg: 0, error: 'No records found' },
        { status: 200 }
      );
    }

    const count = records.length;

    // レコードが0件の場合は平均値も0を返す
    if (count === 0) {
      return NextResponse.json({ count: 0, avg: 0 }, { status: 200 });
    }

    const avg = records.reduce((sum, record) => sum + record.emotion, 0) / count;

    return NextResponse.json({ count, avg }, { status: 200 });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

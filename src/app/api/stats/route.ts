import { NextResponse } from 'next/server';

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
      if (!globalThis.server?.schema) {
        return NextResponse.json(
          { count: 0, avgEmotion: "0.00", error: 'Mock server not initialized' },
          { status: 200 }
        );
      }

      const mockRecords = globalThis.server.schema.all('record').models as Record[];

      if (!mockRecords || !Array.isArray(mockRecords)) {
        return NextResponse.json(
          { count: 0, avgEmotion: "0.00", error: 'No records found' },
          { status: 200 }
        );
      }

      const count = mockRecords.length;
      if (count === 0) {
        return NextResponse.json({ count: 0, avgEmotion: "0.00" }, { status: 200 });
      }

      // デバッグ用にデータを確認
      console.log('First record:', mockRecords[0]);

      const sum = mockRecords.reduce((acc, record) => {
        const emotion = record.attrs?.emotion;
        if (typeof emotion !== 'number') {
          console.warn('Invalid emotion value:', emotion);
          return acc;
        }
        return acc + emotion;
      }, 0);

      const avgEmotion = (sum / count).toFixed(2);
      return NextResponse.json({ count, avgEmotion }, { status: 200 });
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

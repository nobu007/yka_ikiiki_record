import { NextResponse } from "next/server";
import { makeServer } from "@/mirage/server";

function ensureMirage() {
  if (process.env.NEXT_PUBLIC_MOCK === "true" && !globalThis.server) {
    globalThis.server = makeServer();
  }
}

export async function POST(request: Request) {
  try {
    ensureMirage();

    if (!globalThis.server) {
      return NextResponse.json(
        { error: 'Mock server not initialized' },
        { status: 500 }
      );
    }

    // リクエストからパラメータを取得（デフォルト: 25名×365日）
    const { students = 25, days = 365 } = await request.json();
    const total = students * days;

    // 既存のレコードを削除
    globalThis.server.schema.all('record').destroy();

    // 新しいレコードを作成
    globalThis.server.createList("record", total);

    return NextResponse.json(
      { ok: true, total, students, days },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** App Router ではキャッシュを防ぐため */
export const dynamic = "force-dynamic";

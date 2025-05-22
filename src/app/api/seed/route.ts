import { NextResponse } from "next/server";
import { ensureServer } from "@/mirage";

export async function POST(request: Request) {
  try {
    if (process.env.NEXT_PUBLIC_MOCK !== "true") {
      return NextResponse.json(
        { error: 'Mock mode is not enabled' },
        { status: 400 }
      );
    }

    const server = ensureServer();

    // リクエストからパラメータを取得（デフォルト: 25名×365日）
    const { students = 25, days = 365 } = await request.json();
    const total = students * days;

    // 既存のレコードを削除してから新しいレコードを作成
    server.schema.all('record').destroy();
    server.createList("record", total);

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

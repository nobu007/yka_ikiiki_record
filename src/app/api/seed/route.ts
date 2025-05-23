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
    if (!server) {
      return NextResponse.json(
        { error: 'Failed to initialize mock server' },
        { status: 500 }
      );
    }

    // リクエストからパラメータを取得（デフォルト: 30日分のデータ）
    const { days = 30 } = await request.json();

    // 既存の統計データを削除してから新しいデータを作成
    server.schema.all('stat').destroy();
    Array.from({ length: days }).forEach(() => {
      server.schema.create('stat', {});
    });

    return NextResponse.json(
      { ok: true, total: days },
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

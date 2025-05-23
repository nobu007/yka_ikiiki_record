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

    // リクエストからパラメータを取得（デフォルト: 25名×30日分）
    const { students = 25, days = 30 } = await request.json();
    const total = students * days;

    // 既存のレコードを削除してから新しいレコードを作成
    server.schema.all('record').destroy();
    Array.from({ length: total }).forEach(() => {
      server.schema.create('record', {});
    });

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

import { NextResponse } from 'next/server';
import { ensureServer } from '@/mirage';
import { calculateStats } from '@/utils/statsCalculator';

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

    const records = server.schema.all('record').models;
    const stats = calculateStats(records);

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

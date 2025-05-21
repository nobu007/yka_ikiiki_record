import { NextResponse } from 'next/server';

export async function GET() {
  const records = globalThis.server?.schema.all('record').models;

  if (!records) {
    return NextResponse.json({ count: 0, avg: 0 }, { status: 200 });
  }

  const count = records.length;
  const avg = records.reduce((sum, record) => sum + record.emotion, 0) / count;

  return NextResponse.json({ count, avg }, { status: 200 });
}

import { NextResponse } from "next/server";
import { makeServer } from "@/mirage/server";

function ensureMirage() {
  if (process.env.NEXT_PUBLIC_MOCK === "true" && !globalThis.server) {
    globalThis.server = makeServer();
  }
}

export async function POST() {
  ensureMirage();

  // デモ用に 25 名 × 365 日
  globalThis.server?.createList("record", 25 * 365);

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** App Router ではキャッシュを防ぐため */
export const dynamic = "force-dynamic";

import { makeServer } from "./server";

declare global {
  // eslint-disable-next-line no-var
  var mirageServer: ReturnType<typeof makeServer> | undefined;
}

/** 常に同じサーバーインスタンスを返す */
export function ensureServer() {
  // API Routes用のサーバーサイドチェック
  const isServer = typeof window === 'undefined';
  const isApiRoute = process.env.NEXT_RUNTIME === 'nodejs';

  // クライアントサイド または APIルート の場合のみサーバーを初期化
  if ((isServer && isApiRoute || !isServer) && !globalThis.mirageServer) {
    globalThis.mirageServer = makeServer({ environment: "development" });
  }
  return globalThis.mirageServer;
}

// モックモードの場合のみサーバーを初期化
if (process.env.NEXT_PUBLIC_MOCK === "true") {
  ensureServer();
}

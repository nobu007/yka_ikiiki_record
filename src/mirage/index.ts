import { makeServer } from "./server";

// MirageJSサーバーの型を定義
type MirageServer = ReturnType<typeof makeServer>;

// グローバルな型定義を拡張
declare global {
  interface Window {
    server: MirageServer | undefined;
  }
  interface Global {
    server: MirageServer | undefined;
  }
}

// グローバルな型定義（ランタイム用）
declare const global: { server?: MirageServer };

/**
 * サーバーインスタンスの初期化と取得
 * @returns 初期化されたサーバーインスタンス
 */
function ensureServer(): MirageServer {
  const globalObj = typeof window !== 'undefined' ? window : global;
  if (!globalObj.server) {
    globalObj.server = makeServer();
  }
  return globalObj.server;
}

// モックモードの場合のみサーバーを初期化
if (process.env.NEXT_PUBLIC_MOCK === "true") {
  ensureServer();
}

export type { MirageServer };
export { ensureServer };

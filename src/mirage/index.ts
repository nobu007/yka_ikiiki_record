import { makeServer } from "./server";

declare global {
  // eslint-disable-next-line no-var
  var mirageServer: ReturnType<typeof makeServer> | undefined;
}

/** 常に同じサーバーインスタンスを返す */
export function ensureServer() {
  if (!globalThis.mirageServer) {
    globalThis.mirageServer = makeServer({ environment: "development" });
  }
  return globalThis.mirageServer;
}

// モックモードの場合のみサーバーを初期化
if (process.env.NEXT_PUBLIC_MOCK === "true") {
  ensureServer();
}

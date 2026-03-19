import { makeServer } from "./server";

declare global {
  var mirageServer: ReturnType<typeof makeServer> | undefined;
}

export function ensureServer() {
  const isServer = typeof window === "undefined";
  const isApiRoute = process.env.NEXT_RUNTIME === "nodejs";

  if (((isServer && isApiRoute) || !isServer) && !globalThis.mirageServer) {
    globalThis.mirageServer = makeServer({ environment: "development" });
  }
  return globalThis.mirageServer;
}

if (process.env.NEXT_PUBLIC_MOCK === "true") {
  ensureServer();
}

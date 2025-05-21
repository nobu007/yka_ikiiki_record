import { makeServer } from "./server";

declare global {
  var server: ReturnType<typeof makeServer>;
}

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  globalThis.server = makeServer();
}

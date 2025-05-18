import { makeServer } from "./server";
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  makeServer();
}
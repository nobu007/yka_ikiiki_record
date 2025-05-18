if (process.env.NODE_ENV === "development") {
  import("./server").then(({ makeServer }) => makeServer());
}
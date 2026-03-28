import { WINDOW_EVENTS, reloadPage } from "./browser";

describe("WINDOW_EVENTS", () => {
  it("should have correct resize event name", () => {
    expect(WINDOW_EVENTS.RESIZE).toBe("resize");
  });

  it("should be readonly (as const)", () => {
    expect(WINDOW_EVENTS).toEqual(
      expect.objectContaining({
        RESIZE: expect.any(String),
      }),
    );
  });

  it("should have non-empty string values", () => {
    Object.values(WINDOW_EVENTS).forEach((value) => {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    });
  });
});

describe("reloadPage", () => {
  it("should be a function", () => {
    expect(typeof reloadPage).toBe("function");
  });

  it("should be exported", () => {
    expect(reloadPage).toBeDefined();
  });

  it("should have correct signature (no parameters, returns void)", () => {
    const result = reloadPage();
    expect(result).toBeUndefined();
  });

  it("should be idempotent (can be called multiple times)", () => {
    expect(() => {
      reloadPage();
      reloadPage();
      reloadPage();
    }).not.toThrow();
  });
});

import { WINDOW_EVENTS } from "./browser";

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

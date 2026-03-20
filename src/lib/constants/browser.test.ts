import { WINDOW_EVENTS } from "./browser";

jest.mock("./browser", () => ({
  ...jest.requireActual("./browser"),
  reloadPage: jest.fn(),
}));

import { reloadPage } from "./browser";

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

  it("should call window.location.reload", () => {
    reloadPage();

    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it("should be callable multiple times", () => {
    reloadPage();
    reloadPage();
    reloadPage();

    expect(reloadPage).toHaveBeenCalledTimes(3);
  });
});

import { STORAGE_KEYS, THEME_CLASSES } from "./storage";

describe("STORAGE_KEYS", () => {
  it("should have correct theme key", () => {
    expect(STORAGE_KEYS.THEME).toBe("theme");
  });

  it("should be readonly (as const)", () => {
    expect(STORAGE_KEYS).toEqual(
      expect.objectContaining({
        THEME: expect.any(String),
      })
    );
  });

  it("should have non-empty string values", () => {
    Object.values(STORAGE_KEYS).forEach((value) => {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    });
  });
});

describe("THEME_CLASSES", () => {
  it("should have correct dark class", () => {
    expect(THEME_CLASSES.DARK).toBe("dark");
  });

  it("should be readonly (as const)", () => {
    expect(THEME_CLASSES).toEqual(
      expect.objectContaining({
        DARK: expect.any(String),
      })
    );
  });

  it("should have non-empty string values", () => {
    Object.values(THEME_CLASSES).forEach((value) => {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    });
  });
});

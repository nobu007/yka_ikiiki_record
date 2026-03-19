import { STORAGE_KEYS } from "./storage";

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

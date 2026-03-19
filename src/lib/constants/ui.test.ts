import { UI_CONSTANTS, getButtonClasses } from "./ui";

describe("UI_CONSTANTS", () => {
  describe("BUTTON", () => {
    it("has BASE class with essential Tailwind utilities", () => {
      expect(UI_CONSTANTS.BUTTON.BASE).toContain("inline-flex");
      expect(UI_CONSTANTS.BUTTON.BASE).toContain("transition-all");
      expect(UI_CONSTANTS.BUTTON.BASE).toContain("focus:outline-none");
    });

    it("has PRIMARY class with blue color scheme", () => {
      expect(UI_CONSTANTS.BUTTON.PRIMARY).toContain("bg-blue-600");
    });

    it("has SECONDARY class with gray color scheme", () => {
      expect(UI_CONSTANTS.BUTTON.SECONDARY).toContain("bg-gray-600");
    });
  });

  describe("LOADING", () => {
    it("has default and overlay messages as non-empty strings", () => {
      expect(UI_CONSTANTS.LOADING.DEFAULT_MESSAGE).toBeTruthy();
      expect(UI_CONSTANTS.LOADING.OVERLAY_MESSAGE).toBeTruthy();
    });
  });

  describe("SPACING", () => {
    it("has 5 size levels (XS through XL)", () => {
      expect(UI_CONSTANTS.SPACING.XS).toBeDefined();
      expect(UI_CONSTANTS.SPACING.SM).toBeDefined();
      expect(UI_CONSTANTS.SPACING.MD).toBeDefined();
      expect(UI_CONSTANTS.SPACING.LG).toBeDefined();
      expect(UI_CONSTANTS.SPACING.XL).toBeDefined();
    });
  });

  describe("ICON_SIZE", () => {
    it("has 5 size levels with Tailwind h-/w- classes", () => {
      const sizes = [
        UI_CONSTANTS.ICON_SIZE.XS,
        UI_CONSTANTS.ICON_SIZE.SM,
        UI_CONSTANTS.ICON_SIZE.MD,
        UI_CONSTANTS.ICON_SIZE.LG,
        UI_CONSTANTS.ICON_SIZE.XL,
      ];
      sizes.forEach((s) => {
        expect(s).toMatch(/^h-\d+ w-\d+$/);
      });
    });
  });

  describe("NOTIFICATION", () => {
    it("has positive auto-close durations for all types", () => {
      expect(UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.SUCCESS).toBeGreaterThan(0);
      expect(UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.ERROR).toBeGreaterThan(0);
      expect(UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.WARNING).toBeGreaterThan(0);
      expect(UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.INFO).toBeGreaterThan(0);
    });

    it("has error duration longer than success", () => {
      expect(UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.ERROR).toBeGreaterThan(
        UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.SUCCESS,
      );
    });

    it("has base classes string", () => {
      expect(UI_CONSTANTS.NOTIFICATION.BASE_CLASSES).toContain("rounded-lg");
    });
  });

  describe("ERROR_BOUNDARY", () => {
    it("has max-width and padding classes", () => {
      expect(UI_CONSTANTS.ERROR_BOUNDARY.MAX_WIDTH).toContain("max-w-");
      expect(UI_CONSTANTS.ERROR_BOUNDARY.PADDING).toContain("p-");
    });
  });
});

describe("getButtonClasses", () => {
  it("returns primary variant by default", () => {
    const classes = getButtonClasses();
    expect(classes).toContain(UI_CONSTANTS.BUTTON.BASE);
    expect(classes).toContain(UI_CONSTANTS.BUTTON.PRIMARY);
  });

  it("returns primary variant when explicitly specified", () => {
    const classes = getButtonClasses("primary");
    expect(classes).toContain(UI_CONSTANTS.BUTTON.PRIMARY);
    expect(classes).not.toContain(UI_CONSTANTS.BUTTON.SECONDARY);
  });

  it("returns secondary variant classes", () => {
    const classes = getButtonClasses("secondary");
    expect(classes).toContain(UI_CONSTANTS.BUTTON.SECONDARY);
    expect(classes).not.toContain(UI_CONSTANTS.BUTTON.PRIMARY);
  });

  it("includes disabled classes when isDisabled is true", () => {
    const classes = getButtonClasses("primary", true);
    expect(classes).toContain("disabled:opacity-50");
    expect(classes).toContain("disabled:cursor-not-allowed");
  });

  it("does not include extra disabled classes when isDisabled is false", () => {
    const withoutDisabled = getButtonClasses("primary", false);
    const withDefault = getButtonClasses("primary");
    // Both should produce the same result (no trailing disabled classes)
    expect(withoutDisabled).toBe(withDefault);
  });

  it("always includes the base classes", () => {
    expect(getButtonClasses("primary", true)).toContain(
      UI_CONSTANTS.BUTTON.BASE,
    );
    expect(getButtonClasses("secondary", false)).toContain(
      UI_CONSTANTS.BUTTON.BASE,
    );
  });
});

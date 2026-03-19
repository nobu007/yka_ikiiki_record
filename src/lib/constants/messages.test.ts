import {
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  ERROR_MESSAGES,
  UI_TEXT,
  API_ENDPOINTS,
  DATA_GENERATION_FEATURES,
} from "./messages";

describe("SUCCESS_MESSAGES", () => {
  it("has DATA_GENERATION_COMPLETE as non-empty string", () => {
    expect(typeof SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE).toBe("string");
    expect(SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE.length).toBeGreaterThan(0);
  });
});

describe("LOADING_MESSAGES", () => {
  it("has GENERATING_DATA as non-empty string", () => {
    expect(typeof LOADING_MESSAGES.GENERATING_DATA).toBe("string");
    expect(LOADING_MESSAGES.GENERATING_DATA.length).toBeGreaterThan(0);
  });
});

describe("ERROR_MESSAGES", () => {
  it("has all standard error keys as strings", () => {
    const stringKeys = [
      "UNEXPECTED",
      "VALIDATION",
      "NETWORK",
      "TIMEOUT",
      "GENERATION",
      "NOT_FOUND",
      "PERMISSION",
      "NETWORK_ERROR",
      "DEFAULT_GENERATION",
    ] as const;
    stringKeys.forEach((key) => {
      expect(typeof ERROR_MESSAGES[key]).toBe("string");
    });
  });

  it("API_ERROR returns formatted string with status and text", () => {
    expect(ERROR_MESSAGES.API_ERROR(404, "Not Found")).toBe(
      "APIエラー: 404 Not Found",
    );
    expect(ERROR_MESSAGES.API_ERROR(500, "Internal Server Error")).toContain(
      "500",
    );
  });
});

describe("UI_TEXT", () => {
  it("has DASHBOARD section with all required keys", () => {
    expect(UI_TEXT.DASHBOARD.TITLE).toBeTruthy();
    expect(UI_TEXT.DASHBOARD.DESCRIPTION).toBeTruthy();
    expect(UI_TEXT.DASHBOARD.GENERATE_BUTTON).toBeTruthy();
    expect(UI_TEXT.DASHBOARD.GENERATING_BUTTON).toBeTruthy();
    expect(UI_TEXT.DASHBOARD.HELP_TEXT_READY).toBeTruthy();
    expect(UI_TEXT.DASHBOARD.HELP_TEXT_GENERATING).toBeTruthy();
    expect(UI_TEXT.DASHBOARD.CLOSE_NOTIFICATION).toBeTruthy();
  });

  it("has LANDING section", () => {
    expect(UI_TEXT.LANDING.TITLE).toBeTruthy();
    expect(UI_TEXT.LANDING.DASHBOARD_BUTTON).toBeTruthy();
  });

  it("has FEATURES section with all feature labels", () => {
    expect(UI_TEXT.FEATURES.LEARNING_DATA).toBeTruthy();
    expect(UI_TEXT.FEATURES.EMOTION_ANALYSIS).toBeTruthy();
    expect(UI_TEXT.FEATURES.SEASONAL_FACTORS).toBeTruthy();
    expect(UI_TEXT.FEATURES.EVENT_SIMULATION).toBeTruthy();
    expect(UI_TEXT.FEATURES.GENERATED_DATA).toBeTruthy();
  });
});

describe("API_ENDPOINTS", () => {
  it("has SEED endpoint", () => {
    expect(API_ENDPOINTS.SEED).toBe("/api/seed");
  });
});

describe("DATA_GENERATION_FEATURES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(DATA_GENERATION_FEATURES)).toBe(true);
    expect(DATA_GENERATION_FEATURES.length).toBeGreaterThan(0);
  });

  it("contains all feature text entries from UI_TEXT.FEATURES", () => {
    expect(DATA_GENERATION_FEATURES).toContain(UI_TEXT.FEATURES.LEARNING_DATA);
    expect(DATA_GENERATION_FEATURES).toContain(
      UI_TEXT.FEATURES.EMOTION_ANALYSIS,
    );
    expect(DATA_GENERATION_FEATURES).toContain(
      UI_TEXT.FEATURES.SEASONAL_FACTORS,
    );
    expect(DATA_GENERATION_FEATURES).toContain(
      UI_TEXT.FEATURES.EVENT_SIMULATION,
    );
  });
});

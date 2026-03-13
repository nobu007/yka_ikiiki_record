import { APP_CONFIG, EMOTION_CONFIG, UI_CONFIG, MESSAGES } from './index';

describe('APP_CONFIG', () => {
  it('has correct app name and description', () => {
    expect(APP_CONFIG.name).toBe('イキイキレコード デモ');
    expect(APP_CONFIG.description).toContain('生徒の学習データ');
  });

  it('has api configuration with baseUrl and endpoints', () => {
    expect(APP_CONFIG.api.baseUrl).toBeDefined();
    expect(APP_CONFIG.api.endpoints.seed).toBe('/seed');
  });

  it('has generation defaults', () => {
    expect(APP_CONFIG.generation.defaultPeriodDays).toBe(30);
    expect(APP_CONFIG.generation.defaultStudentCount).toBe(20);
    expect(APP_CONFIG.generation.defaultPattern).toBe('normal');
  });
});

describe('EMOTION_CONFIG', () => {
  it('has valid min/max range', () => {
    expect(EMOTION_CONFIG.min).toBe(1);
    expect(EMOTION_CONFIG.max).toBe(5);
    expect(EMOTION_CONFIG.min).toBeLessThan(EMOTION_CONFIG.max);
  });

  it('has defaultStddev as positive number', () => {
    expect(EMOTION_CONFIG.defaultStddev).toBeGreaterThan(0);
  });

  it('has seasonalImpact and maxEventImpact within [0,1]', () => {
    expect(EMOTION_CONFIG.seasonalImpact).toBeGreaterThanOrEqual(0);
    expect(EMOTION_CONFIG.seasonalImpact).toBeLessThanOrEqual(1);
    expect(EMOTION_CONFIG.maxEventImpact).toBeGreaterThanOrEqual(0);
    expect(EMOTION_CONFIG.maxEventImpact).toBeLessThanOrEqual(1);
  });

  it('has 12 seasonal factors (one per month)', () => {
    expect(EMOTION_CONFIG.seasonalFactors).toHaveLength(12);
    EMOTION_CONFIG.seasonalFactors.forEach((f) => {
      expect(typeof f).toBe('number');
    });
  });

  it('has baseEmotions for all distribution patterns', () => {
    expect(EMOTION_CONFIG.baseEmotions.normal).toBeDefined();
    expect(EMOTION_CONFIG.baseEmotions.bimodal).toBeDefined();
    expect(EMOTION_CONFIG.baseEmotions.stress).toBeDefined();
    expect(EMOTION_CONFIG.baseEmotions.happy).toBeDefined();
  });

  it('has baseEmotions within min/max range', () => {
    const values = Object.values(EMOTION_CONFIG.baseEmotions);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(EMOTION_CONFIG.min);
      expect(v).toBeLessThanOrEqual(EMOTION_CONFIG.max);
    });
  });
});

describe('UI_CONFIG', () => {
  it('defines morning/afternoon/evening time ranges', () => {
    expect(UI_CONFIG.timeRanges.morning).toEqual({ start: 5, end: 12 });
    expect(UI_CONFIG.timeRanges.afternoon).toEqual({ start: 12, end: 18 });
    expect(UI_CONFIG.timeRanges.evening).toEqual({ start: 18, end: 24 });
  });

  it('has time ranges that are contiguous (afternoon starts where morning ends)', () => {
    expect(UI_CONFIG.timeRanges.afternoon.start).toBe(UI_CONFIG.timeRanges.morning.end);
    expect(UI_CONFIG.timeRanges.evening.start).toBe(UI_CONFIG.timeRanges.afternoon.end);
  });

  it('has 7 days of week labels', () => {
    expect(UI_CONFIG.daysOfWeek).toHaveLength(7);
    expect(UI_CONFIG.daysOfWeek[0]).toBe('日');
    expect(UI_CONFIG.daysOfWeek[6]).toBe('土');
  });

  it('has primary and secondary button styles', () => {
    expect(UI_CONFIG.buttonStyles.primary).toContain('bg-blue-600');
    expect(UI_CONFIG.buttonStyles.secondary).toContain('bg-gray-200');
  });
});

describe('MESSAGES', () => {
  describe('success', () => {
    it('has dataGeneration message', () => {
      expect(MESSAGES.success.dataGeneration).toBeTruthy();
    });
  });

  describe('error', () => {
    it('has all standard error messages as strings', () => {
      expect(typeof MESSAGES.error.network).toBe('string');
      expect(typeof MESSAGES.error.validation).toBe('string');
      expect(typeof MESSAGES.error.generation).toBe('string');
      expect(typeof MESSAGES.error.unexpected).toBe('string');
      expect(typeof MESSAGES.error.timeout).toBe('string');
      expect(typeof MESSAGES.error.notFound).toBe('string');
      expect(typeof MESSAGES.error.permission).toBe('string');
    });

    it('api() returns formatted error string with status code and text', () => {
      const result = MESSAGES.error.api(404, 'Not Found');
      expect(result).toBe('APIエラー: 404 Not Found');
    });

    it('api() handles various status codes', () => {
      expect(MESSAGES.error.api(500, 'Internal Server Error')).toContain('500');
      expect(MESSAGES.error.api(403, 'Forbidden')).toContain('403');
      expect(MESSAGES.error.api(200, 'OK')).toBe('APIエラー: 200 OK');
    });
  });

  describe('loading', () => {
    it('has generating message', () => {
      expect(MESSAGES.loading.generating).toBeTruthy();
    });
  });

  describe('ui', () => {
    it('has dashboard section with all required keys', () => {
      expect(MESSAGES.ui.dashboard.title).toBeTruthy();
      expect(MESSAGES.ui.dashboard.dataGeneration).toBeTruthy();
      expect(MESSAGES.ui.dashboard.generateButton).toBeTruthy();
      expect(MESSAGES.ui.dashboard.generatingButton).toBeTruthy();
      expect(MESSAGES.ui.dashboard.helpTextReady).toBeTruthy();
      expect(MESSAGES.ui.dashboard.helpTextGenerating).toBeTruthy();
    });

    it('has features with generatedData array', () => {
      expect(Array.isArray(MESSAGES.ui.features.generatedData)).toBe(true);
      expect(MESSAGES.ui.features.generatedData.length).toBeGreaterThan(0);
    });

    it('has landing section', () => {
      expect(MESSAGES.ui.landing.title).toBeTruthy();
      expect(MESSAGES.ui.landing.dashboardButton).toBeTruthy();
    });
  });
});

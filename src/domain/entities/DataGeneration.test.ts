import { DEFAULT_CONFIG, EMOTION_CONSTANTS } from './DataGeneration';

describe('DEFAULT_CONFIG', () => {
  it('has studentCount as positive integer', () => {
    expect(DEFAULT_CONFIG.studentCount).toBeGreaterThan(0);
    expect(Number.isInteger(DEFAULT_CONFIG.studentCount)).toBe(true);
  });

  it('has periodDays as positive integer', () => {
    expect(DEFAULT_CONFIG.periodDays).toBeGreaterThan(0);
    expect(Number.isInteger(DEFAULT_CONFIG.periodDays)).toBe(true);
  });

  it('has distributionPattern as valid pattern', () => {
    const validPatterns = ['normal', 'bimodal', 'stress', 'happy'];
    expect(validPatterns).toContain(DEFAULT_CONFIG.distributionPattern);
  });

  it('has seasonalEffects as boolean', () => {
    expect(typeof DEFAULT_CONFIG.seasonalEffects).toBe('boolean');
  });

  it('has eventEffects as empty array', () => {
    expect(Array.isArray(DEFAULT_CONFIG.eventEffects)).toBe(true);
    expect(DEFAULT_CONFIG.eventEffects).toHaveLength(0);
  });

  it('has classCharacteristics with valid ranges', () => {
    const cc = DEFAULT_CONFIG.classCharacteristics;
    expect(cc.baselineEmotion).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MIN_EMOTION);
    expect(cc.baselineEmotion).toBeLessThanOrEqual(EMOTION_CONSTANTS.MAX_EMOTION);
    expect(cc.volatility).toBeGreaterThan(0);
    expect(cc.cohesion).toBeGreaterThanOrEqual(0);
    expect(cc.cohesion).toBeLessThanOrEqual(1);
  });
});

describe('EMOTION_CONSTANTS', () => {
  it('has MIN_EMOTION less than MAX_EMOTION', () => {
    expect(EMOTION_CONSTANTS.MIN_EMOTION).toBeLessThan(EMOTION_CONSTANTS.MAX_EMOTION);
  });

  it('has positive DEFAULT_STDDEV', () => {
    expect(EMOTION_CONSTANTS.DEFAULT_STDDEV).toBeGreaterThan(0);
  });

  it('has SEASONAL_IMPACT within [0, 1]', () => {
    expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeGreaterThanOrEqual(0);
    expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeLessThanOrEqual(1);
  });

  it('has MAX_EVENT_IMPACT within [0, 1]', () => {
    expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBeGreaterThanOrEqual(0);
    expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBeLessThanOrEqual(1);
  });
});

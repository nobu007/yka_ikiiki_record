import {
  EmotionDistributionPatternSchema,
  EventEffectSchema,
  ClassCharacteristicsSchema,
} from './api';

describe('Schemas - Patterns & Effects', () => {
  describe('EmotionDistributionPatternSchema', () => {
    it.each(['normal', 'bimodal', 'stress', 'happy'])('accepts "%s"', (pattern) => {
      expect(EmotionDistributionPatternSchema.parse(pattern)).toBe(pattern);
    });

    it('rejects invalid pattern', () => {
      expect(() => EmotionDistributionPatternSchema.parse('invalid')).toThrow();
    });
  });

  describe('EventEffectSchema', () => {
    const validEvent = {
      name: 'テスト',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-07'),
      impact: 0.5,
    };

    it('accepts valid event', () => {
      const result = EventEffectSchema.parse(validEvent);
      expect(result.name).toBe('テスト');
      expect(result.impact).toBe(0.5);
    });

    it('rejects empty name', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, name: '' })).toThrow();
    });

    it('rejects name exceeding 100 chars', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, name: 'a'.repeat(101) })).toThrow();
    });

    it('rejects impact below -1', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, impact: -1.1 })).toThrow();
    });

    it('rejects impact above 1', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, impact: 1.1 })).toThrow();
    });

    it('accepts boundary impact values -1 and 1', () => {
      expect(EventEffectSchema.parse({ ...validEvent, impact: -1 }).impact).toBe(-1);
      expect(EventEffectSchema.parse({ ...validEvent, impact: 1 }).impact).toBe(1);
    });
  });

  describe('ClassCharacteristicsSchema', () => {
    const valid = { baselineEmotion: 3.0, volatility: 0.5, cohesion: 0.5 };

    it('accepts valid characteristics', () => {
      expect(ClassCharacteristicsSchema.parse(valid)).toEqual(valid);
    });

    it('rejects baselineEmotion below 2.5', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 2.4 })).toThrow();
    });

    it('rejects baselineEmotion above 3.5', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 3.6 })).toThrow();
    });

    it('accepts boundary baselineEmotion values', () => {
      expect(ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 2.5 }).baselineEmotion).toBe(2.5);
      expect(ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 3.5 }).baselineEmotion).toBe(3.5);
    });

    it('rejects volatility below 0.1', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, volatility: 0.09 })).toThrow();
    });

    it('rejects volatility above 1.0', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, volatility: 1.1 })).toThrow();
    });

    it('rejects cohesion below 0.1', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, cohesion: 0.09 })).toThrow();
    });

    it('rejects cohesion above 1.0', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, cohesion: 1.1 })).toThrow();
    });
  });
});

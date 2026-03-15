import { dataService } from './dataService';
import { APP_CONFIG } from '@/lib/config';

describe('DataService - Config', () => {
  describe('createDefaultConfig', () => {
    it('should return config matching APP_CONFIG defaults', () => {
      // Act
      const config = dataService.createDefaultConfig();

      // Assert
      expect(config.periodDays).toBe(APP_CONFIG.generation.defaultPeriodDays);
      expect(config.studentCount).toBe(APP_CONFIG.generation.defaultStudentCount);
      expect(config.distributionPattern).toBe(APP_CONFIG.generation.defaultPattern);
      expect(config.seasonalEffects).toBe(true);
      expect(config.eventEffects).toEqual([]);
    });

    it('should return a new object on each call', () => {
      // Act
      const config1 = dataService.createDefaultConfig();
      const config2 = dataService.createDefaultConfig();

      // Assert
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });
});

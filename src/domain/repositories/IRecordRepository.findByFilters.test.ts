import { IRecordRepository } from '@/domain/repositories/IRecordRepository';
import { createMockRepository, createTestRecord } from './IRecordRepository.test.setup';

describe('IRecordRepository - findByFilters', () => {
  let repository: IRecordRepository;

  beforeEach(() => {
    repository = createMockRepository();
  });

  describe('findByDateRange', () => {
    beforeEach(async () => {
      const records = [
        createTestRecord({
          emotion: 4.5,
          date: new Date('2026-03-10T10:00:00Z'),
          student: '学生1',
        }),
        createTestRecord({
          emotion: 3.5,
          date: new Date('2026-03-15T10:00:00Z'),
          student: '学生2',
        }),
        createTestRecord({
          emotion: 2.5,
          date: new Date('2026-03-20T10:00:00Z'),
          student: '学生3',
        }),
      ];

      await repository.saveMany(records);
    });

    it('should find records within date range', async () => {
      const startDate = new Date('2026-03-12T00:00:00Z');
      const endDate = new Date('2026-03-18T23:59:59Z');

      const found = await repository.findByDateRange(startDate, endDate);

      expect(found).toHaveLength(1);
      expect(found[0].student).toBe('学生2');
    });

    it('should return empty array when no records in range', async () => {
      const startDate = new Date('2026-03-25T00:00:00Z');
      const endDate = new Date('2026-03-30T23:59:59Z');

      const found = await repository.findByDateRange(startDate, endDate);

      expect(found).toEqual([]);
    });

    it('should include records on range boundaries', async () => {
      const startDate = new Date('2026-03-10T00:00:00Z');
      const endDate = new Date('2026-03-20T23:59:59Z');

      const found = await repository.findByDateRange(startDate, endDate);

      expect(found).toHaveLength(3);
    });
  });

  describe('findByStudent', () => {
    beforeEach(async () => {
      const records = [
        createTestRecord({
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        }),
        createTestRecord({
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生1',
        }),
        createTestRecord({
          emotion: 2.5,
          date: new Date('2026-03-18T10:00:00Z'),
          student: '学生2',
        }),
      ];

      await repository.saveMany(records);
    });

    it('should find records by student', async () => {
      const found = await repository.findByStudent('学生1');

      expect(found).toHaveLength(2);
    });

    it('should return empty array when student has no records', async () => {
      const found = await repository.findByStudent('学生999');

      expect(found).toEqual([]);
    });

    it('should return all records for a student in chronological order', async () => {
      const found = await repository.findByStudent('学生1');

      expect(found).toHaveLength(2);
      expect(found[0].date.getTime()).toBeLessThan(found[1].date.getTime());
    });
  });
});

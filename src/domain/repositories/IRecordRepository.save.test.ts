import { IRecordRepository } from '@/domain/repositories/IRecordRepository';
import { Record } from '@/domain/entities/Record';
import { createMockRepository, createTestRecord } from './IRecordRepository.test.setup';

describe('IRecordRepository - save', () => {
  let repository: IRecordRepository;

  beforeEach(() => {
    repository = createMockRepository();
  });

  describe('save', () => {
    it('should create a new record without id', async () => {
      const record = createTestRecord({
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      });

      const saved = await repository.save(record);

      expect(saved.id).toBeDefined();
      expect(saved.emotion).toBe(record.emotion);
    });

    it('should update an existing record with id', async () => {
      const record = createTestRecord({
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      });

      const saved = await repository.save(record);
      const updated: Record = {
        ...saved,
        emotion: 3.5,
      };

      const result = await repository.save(updated);

      expect(result.id).toBe(saved.id);
      expect(result.emotion).toBe(3.5);
    });

    it('should assign sequential ids to new records', async () => {
      const record1 = createTestRecord({ student: '学生1' });
      const record2 = createTestRecord({ student: '学生2' });

      const saved1 = await repository.save(record1);
      const saved2 = await repository.save(record2);

      expect(saved2.id).toBe(saved1.id! + 1);
    });

    it('should preserve all properties when saving', async () => {
      const record = createTestRecord({
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      });

      const saved = await repository.save(record);

      expect(saved.emotion).toBe(record.emotion);
      expect(saved.date).toEqual(record.date);
      expect(saved.student).toBe(record.student);
    });
  });

  describe('saveMany', () => {
    it('should save multiple records', async () => {
      const records = [
        createTestRecord({
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        }),
        createTestRecord({
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生2',
        }),
      ];

      await repository.saveMany(records);

      const count = await repository.count();
      expect(count).toBe(2);
    });

    it('should return all saved records', async () => {
      const records = [
        createTestRecord({
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        }),
        createTestRecord({
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生2',
        }),
      ];

      const saved = await repository.saveMany(records);

      expect(saved).toHaveLength(2);
      expect(saved[0].id).toBeDefined();
      expect(saved[1].id).toBeDefined();
    });

    it('should assign unique ids to all saved records', async () => {
      const records = [
        createTestRecord({ student: '学生1' }),
        createTestRecord({ student: '学生2' }),
        createTestRecord({ student: '学生3' }),
      ];

      const saved = await repository.saveMany(records);
      const ids = saved.map((r) => r.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });

    it('should handle empty array', async () => {
      const saved = await repository.saveMany([]);

      expect(saved).toEqual([]);
      const count = await repository.count();
      expect(count).toBe(0);
    });
  });
});

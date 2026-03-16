import { IRecordRepository } from '@/domain/repositories/IRecordRepository';
import { createMockRepository, createTestRecord } from './IRecordRepository.test.setup';

describe('IRecordRepository - findAll', () => {
  let repository: IRecordRepository;

  beforeEach(() => {
    repository = createMockRepository();
  });

  describe('findAll', () => {
    it('should return empty array when no records exist', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should return all records', async () => {
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
      const found = await repository.findAll();

      expect(found).toHaveLength(2);
    });

    it('should return records in insertion order', async () => {
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
        createTestRecord({
          emotion: 2.5,
          date: new Date('2026-03-18T10:00:00Z'),
          student: '学生3',
        }),
      ];

      await repository.saveMany(records);
      const found = await repository.findAll();

      expect(found).toHaveLength(3);
      expect(found[0]!.student).toBe('学生1');
      expect(found[1]!.student).toBe('学生2');
      expect(found[2]!.student).toBe('学生3');
    });

    it('should return all records with complete data', async () => {
      const record = createTestRecord({
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      });

      await repository.save(record);
      const found = await repository.findAll();

      expect(found).toHaveLength(1);
      expect(found[0]!.emotion).toBe(4.5);
      expect(found[0]!.date).toEqual(new Date('2026-03-16T10:00:00Z'));
      expect(found[0]!.student).toBe('学生1');
      expect(found[0]!.id).toBeDefined();
    });
  });
});

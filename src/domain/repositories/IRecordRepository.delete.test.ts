import { IRecordRepository } from '@/domain/repositories/IRecordRepository';
import { createMockRepository, createTestRecord } from './IRecordRepository.test.setup';

describe('IRecordRepository - delete', () => {
  let repository: IRecordRepository;

  beforeEach(() => {
    repository = createMockRepository();
  });

  describe('delete', () => {
    it('should delete a record by id', async () => {
      const record = createTestRecord({
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      });

      const saved = await repository.save(record);
      await repository.delete(saved.id!);

      const found = await repository.findById(saved.id!);
      expect(found).toBeNull();
    });

    it('should not affect other records when deleting one', async () => {
      const record1 = createTestRecord({ student: '学生1' });
      const record2 = createTestRecord({ student: '学生2' });

      const saved1 = await repository.save(record1);
      const saved2 = await repository.save(record2);

      await repository.delete(saved1.id!);

      const found = await repository.findById(saved2.id!);
      expect(found).not.toBeNull();
      expect(found!.student).toBe('学生2');
    });

    it('should handle deleting non-existent record gracefully', async () => {
      await expect(repository.delete(999)).resolves.not.toThrow();
    });

    it('should decrement count after deletion', async () => {
      const record = createTestRecord({ student: '学生1' });

      const saved = await repository.save(record);
      expect(await repository.count()).toBe(1);

      await repository.delete(saved.id!);
      expect(await repository.count()).toBe(0);
    });
  });

  describe('deleteAll', () => {
    it('should delete all records', async () => {
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
      await repository.deleteAll();

      const count = await repository.count();
      expect(count).toBe(0);
    });

    it('should handle deleting from empty repository', async () => {
      await expect(repository.deleteAll()).resolves.not.toThrow();
      const count = await repository.count();
      expect(count).toBe(0);
    });

    it('should allow adding records after deleteAll', async () => {
      const record = createTestRecord({ student: '学生1' });
      await repository.save(record);
      await repository.deleteAll();

      const newRecord = createTestRecord({ student: '学生2' });
      const saved = await repository.save(newRecord);

      expect(saved.id).toBeDefined();
      expect(await repository.count()).toBe(1);
    });
  });

  describe('count', () => {
    it('should return 0 when no records exist', async () => {
      const count = await repository.count();

      expect(count).toBe(0);
    });

    it('should return the count of records', async () => {
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

      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('should increment after each save', async () => {
      expect(await repository.count()).toBe(0);

      await repository.save(createTestRecord({ student: '学生1' }));
      expect(await repository.count()).toBe(1);

      await repository.save(createTestRecord({ student: '学生2' }));
      expect(await repository.count()).toBe(2);

      await repository.save(createTestRecord({ student: '学生3' }));
      expect(await repository.count()).toBe(3);
    });

    it('should decrement after deletion', async () => {
      const records = [
        createTestRecord({ student: '学生1' }),
        createTestRecord({ student: '学生2' }),
        createTestRecord({ student: '学生3' }),
      ];

      const saved = await repository.saveMany(records);
      expect(await repository.count()).toBe(3);

      await repository.delete(saved[0]!.id!);
      expect(await repository.count()).toBe(2);

      await repository.delete(saved[1]!.id!);
      expect(await repository.count()).toBe(1);
    });
  });
});

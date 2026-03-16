import { IRecordRepository } from '@/domain/repositories/IRecordRepository';
import { Record } from '@/domain/entities/Record';

class MockRecordRepository implements IRecordRepository {
  private records: Map<number, Record> = new Map();
  private nextId = 1;

  async findById(id: number): Promise<Record | null> {
    return this.records.get(id) || null;
  }

  async findAll(): Promise<Record[]> {
    return Array.from(this.records.values());
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Record[]> {
    return Array.from(this.records.values()).filter(
      (record) => record.date >= startDate && record.date <= endDate
    );
  }

  async findByStudent(student: string): Promise<Record[]> {
    return Array.from(this.records.values()).filter((record) => record.student === student);
  }

  async save(record: Record): Promise<Record> {
    const id = record.id || this.nextId++;
    const saved = { ...record, id };
    this.records.set(id, saved);
    return saved;
  }

  async saveMany(records: Record[]): Promise<Record[]> {
    return Promise.all(records.map((record) => this.save(record)));
  }

  async delete(id: number): Promise<void> {
    this.records.delete(id);
  }

  async deleteAll(): Promise<void> {
    this.records.clear();
  }

  async count(): Promise<number> {
    return this.records.size;
  }
}

describe('IRecordRepository Contract', () => {
  let repository: IRecordRepository;

  beforeEach(() => {
    repository = new MockRecordRepository();
  });

  describe('findById', () => {
    it('should return null when record does not exist', async () => {
      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it('should find a record by id', async () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      };

      const saved = await repository.save(record);
      const found = await repository.findById(saved.id!);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(saved.id);
      expect(found!.emotion).toBe(record.emotion);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no records exist', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should return all records', async () => {
      const records: Record[] = [
        {
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        },
        {
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生2',
        },
      ];

      await repository.saveMany(records);
      const found = await repository.findAll();

      expect(found).toHaveLength(2);
    });
  });

  describe('findByDateRange', () => {
    beforeEach(async () => {
      const records: Record[] = [
        {
          emotion: 4.5,
          date: new Date('2026-03-10T10:00:00Z'),
          student: '学生1',
        },
        {
          emotion: 3.5,
          date: new Date('2026-03-15T10:00:00Z'),
          student: '学生2',
        },
        {
          emotion: 2.5,
          date: new Date('2026-03-20T10:00:00Z'),
          student: '学生3',
        },
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
  });

  describe('findByStudent', () => {
    beforeEach(async () => {
      const records: Record[] = [
        {
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        },
        {
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生1',
        },
        {
          emotion: 2.5,
          date: new Date('2026-03-18T10:00:00Z'),
          student: '学生2',
        },
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
  });

  describe('save', () => {
    it('should create a new record without id', async () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      };

      const saved = await repository.save(record);

      expect(saved.id).toBeDefined();
      expect(saved.emotion).toBe(record.emotion);
    });

    it('should update an existing record with id', async () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      };

      const saved = await repository.save(record);
      const updated: Record = {
        ...saved,
        emotion: 3.5,
      };

      const result = await repository.save(updated);

      expect(result.id).toBe(saved.id);
      expect(result.emotion).toBe(3.5);
    });
  });

  describe('saveMany', () => {
    it('should save multiple records', async () => {
      const records: Record[] = [
        {
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        },
        {
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生2',
        },
      ];

      await repository.saveMany(records);

      const count = await repository.count();
      expect(count).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete a record by id', async () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date('2026-03-16T10:00:00Z'),
        student: '学生1',
      };

      const saved = await repository.save(record);
      await repository.delete(saved.id!);

      const found = await repository.findById(saved.id!);
      expect(found).toBeNull();
    });
  });

  describe('deleteAll', () => {
    it('should delete all records', async () => {
      const records: Record[] = [
        {
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        },
        {
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生2',
        },
      ];

      await repository.saveMany(records);
      await repository.deleteAll();

      const count = await repository.count();
      expect(count).toBe(0);
    });
  });

  describe('count', () => {
    it('should return 0 when no records exist', async () => {
      const count = await repository.count();

      expect(count).toBe(0);
    });

    it('should return the count of records', async () => {
      const records: Record[] = [
        {
          emotion: 4.5,
          date: new Date('2026-03-16T10:00:00Z'),
          student: '学生1',
        },
        {
          emotion: 3.5,
          date: new Date('2026-03-17T10:00:00Z'),
          student: '学生2',
        },
        {
          emotion: 2.5,
          date: new Date('2026-03-18T10:00:00Z'),
          student: '学生3',
        },
      ];

      await repository.saveMany(records);

      const count = await repository.count();
      expect(count).toBe(3);
    });
  });
});

import { IRecordRepository } from '@/domain/repositories/IRecordRepository';
import { Record } from '@/domain/entities/Record';

/**
 * Mock implementation of IRecordRepository for testing
 */
export class MockRecordRepository implements IRecordRepository {
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

/**
 * Helper function to create a fresh repository instance
 */
export function createMockRepository(): IRecordRepository {
  return new MockRecordRepository();
}

/**
 * Helper function to create a test record
 */
export function createTestRecord(overrides?: Partial<Record>): Record {
  return {
    emotion: 4.5,
    date: new Date('2026-03-16T10:00:00Z'),
    student: '学生1',
    ...overrides,
  };
}

/**
 * Helper function to create multiple test records
 */
export function createTestRecords(count: number, overrides?: Partial<Record>): Record[] {
  return Array.from({ length: count }, (_, i) =>
    createTestRecord({
      student: `学生${i + 1}`,
      date: new Date(`2026-03-${(16 + i).toString().padStart(2, '0')}T10:00:00Z`),
      ...overrides,
    })
  );
}

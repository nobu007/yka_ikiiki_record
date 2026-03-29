import type { Record } from "@/domain/entities/Record";
import type { IRecordRepository } from "@/domain/repositories/IRecordRepository";

/**
 * In-memory implementation of IRecordRepository for testing and development.
 *
 * This implementation stores records in memory and is suitable for:
 * - Unit tests
 * - Development environments (Mirage mode)
 * - Integration tests without database dependencies
 *
 * Note: Data is lost when the process exits.
 */
export class InMemoryRecordRepository implements IRecordRepository {
  private records: Record[] = [];

  async create(data: Omit<Record, "id">): Promise<Record> {
    const newRecord: Record = {
      ...data,
      id: this.records.length + 1,
    };
    this.records.push(newRecord);
    return newRecord;
  }

  async save(record: Record): Promise<Record> {
    const index = this.records.findIndex((r) => r.id === record.id);
    if (index !== -1) {
      this.records[index] = record;
      return record;
    }
    this.records.push(record);
    return record;
  }

  async findAll(): Promise<Record[]> {
    return [...this.records];
  }

  async findById(id: number): Promise<Record | null> {
    return this.records.find((r) => r.id === id) ?? null;
  }

  async delete(id: number): Promise<void> {
    const index = this.records.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
    }
  }

  async count(): Promise<number> {
    return this.records.length;
  }

  /**
   * Helper method for tests to add records directly.
   */
  _addRecord(record: Record): void {
    this.records.push(record);
  }

  /**
   * Helper method for tests to clear all records.
   */
  _clear(): void {
    this.records.length = 0;
  }
}

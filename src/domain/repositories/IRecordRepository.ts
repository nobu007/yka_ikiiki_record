import { Record } from '@/domain/entities/Record';

export interface IRecordRepository {
  findById(id: number): Promise<Record | null>;

  findAll(): Promise<Record[]>;

  findByDateRange(startDate: Date, endDate: Date): Promise<Record[]>;

  findByStudent(student: string): Promise<Record[]>;

  save(record: Record): Promise<Record>;

  saveMany(records: Record[]): Promise<Record[]>;

  delete(id: number): Promise<void>;

  deleteAll(): Promise<void>;

  count(): Promise<number>;
}

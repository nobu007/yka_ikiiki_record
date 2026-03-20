import { Record } from "@/domain/entities/Record";

/**
 * Repository interface for individual emotion record persistence.
 *
 * Defines CRUD operations for student emotion records with support
 * for querying by date range, student, and bulk operations.
 *
 * @example
 * ```ts
 * class PrismaRecordRepository implements IRecordRepository {
 *   async findById(id: number): Promise<Record | null> {
 *     return await prisma.record.findUnique({ where: { id } });
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface IRecordRepository {
  /**
   * Finds a single record by its ID.
   *
   * @param id - Unique identifier of the record.
   * @returns Promise resolving to the record or null if not found.
   */
  findById(id: number): Promise<Record | null>;

  /**
   * Retrieves all records from the repository.
   *
   * @returns Promise resolving to array of all records.
   */
  findAll(): Promise<Record[]>;

  /**
   * Finds records within a date range (inclusive).
   *
   * @param startDate - Start of date range.
   * @param endDate - End of date range.
   * @returns Promise resolving to array of matching records.
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Record[]>;

  /**
   * Finds all records for a specific student.
   *
   * @param student - Student identifier string.
   * @returns Promise resolving to array of student's records.
   */
  findByStudent(student: string): Promise<Record[]>;

  /**
   * Saves a single record (create or update).
   *
   * @param record - Record to save. If it has an ID, updates existing record.
   * @returns Promise resolving to the saved record.
   */
  save(record: Record): Promise<Record>;

  /**
   * Saves multiple records in a single transaction.
   *
   * @param records - Array of records to save.
   * @returns Promise resolving to array of saved records.
   */
  saveMany(records: Record[]): Promise<Record[]>;

  /**
   * Deletes a record by ID.
   *
   * @param id - Unique identifier of the record to delete.
   * @returns Promise that resolves when deletion completes.
   */
  delete(id: number): Promise<void>;

  /**
   * Deletes all records from the repository.
   *
   * Use with caution - this is a destructive operation.
   *
   * @returns Promise that resolves when all records are deleted.
   */
  deleteAll(): Promise<void>;

  /**
   * Counts total number of records in the repository.
   *
   * @returns Promise resolving to the count.
   */
  count(): Promise<number>;
}

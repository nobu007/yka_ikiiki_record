import type { Anomaly, AnomalyContext } from "@/domain/entities/Anomaly";

/**
 * Repository interface for Anomaly persistence and retrieval.
 *
 * Provides CRUD operations for managing detected anomalies.
 * Following Clean Architecture, this is a domain interface that
 * defines the contract for infrastructure implementations.
 *
 * @example
 * ```ts
 * // In-memory implementation for testing
 * class InMemoryAnomalyRepository implements AnomalyRepository {
 *   private anomalies: Map<string, Anomaly> = new Map();
 *   // ... implementation
 * }
 *
 * // Database implementation for production
 * class PrismaAnomalyRepository implements AnomalyRepository {
 *   constructor(private prisma: PrismaClient) {}
 *   // ... implementation
 * }
 * ```
 */
export interface AnomalyRepository {
  /**
   * Save a new anomaly or update an existing one
   *
   * @param anomaly - The anomaly to save
   * @returns The saved anomaly with generated ID if new
   * @throws {Error} If save operation fails
   */
  save(anomaly: Anomaly): Promise<Anomaly>;

  /**
   * Find an anomaly by its unique identifier
   *
   * @param id - The anomaly ID to find
   * @returns The anomaly if found, undefined otherwise
   */
  findById(id: string): Promise<Anomaly | undefined>;

  /**
   * Find all anomalies, optionally filtered by criteria
   *
   * @param options - Optional filter and pagination options
   * @returns Array of anomalies matching the criteria
   */
  findAll(options?: AnomalyFilterOptions): Promise<Anomaly[]>;

  /**
   * Find anomalies by severity level
   *
   * @param severity - The severity level to filter by
   * @returns Array of anomalies with the specified severity
   */
  findBySeverity(severity: string): Promise<Anomaly[]>;

  /**
   * Find anomalies by type
   *
   * @param type - The anomaly type to filter by
   * @returns Array of anomalies with the specified type
   */
  findByType(type: string): Promise<Anomaly[]>;

  /**
   * Find unacknowledged anomalies
   *
   * @returns Array of anomalies that have not been acknowledged
   */
  findUnacknowledged(): Promise<Anomaly[]>;

  /**
   * Find anomalies for a specific student
   *
   * @param student - The student name to filter by
   * @returns Array of anomalies related to the student
   */
  findByStudent(student: string): Promise<Anomaly[]>;

  /**
   * Find anomalies within a date range
   *
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Array of anomalies detected within the date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Anomaly[]>;

  /**
   * Mark an anomaly as acknowledged
   *
   * @param id - The anomaly ID to acknowledge
   * @returns The updated anomaly if found, undefined otherwise
   */
  acknowledge(id: string): Promise<Anomaly | undefined>;

  /**
   * Delete an anomaly by ID
   *
   * @param id - The anomaly ID to delete
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Delete old anomalies beyond a certain date
   *
   * @param beforeDate - Delete anomalies detected before this date
   * @returns Number of anomalies deleted
   */
  deleteOldAnomalies(beforeDate: Date): Promise<number>;

  /**
   * Get anomaly statistics
   *
   * @returns Statistical summary of anomalies
   */
  getStatistics(): Promise<AnomalyStatistics>;
}

/**
 * Filter options for finding anomalies
 */
export interface AnomalyFilterOptions {
  /** Filter by severity */
  severity?: string;
  /** Filter by type */
  type?: string;
  /** Filter by student */
  student?: string;
  /** Filter by acknowledged status */
  acknowledged?: boolean;
  /** Filter by date range start */
  startDate?: Date;
  /** Filter by date range end */
  endDate?: Date;
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort by field (default: detectedAt) */
  sortBy?: keyof Anomaly | "detectedAt";
  /** Sort order (default: desc) */
  sortOrder?: "asc" | "desc";
}

/**
 * Anomaly statistics summary
 */
export interface AnomalyStatistics {
  /** Total number of anomalies */
  total: number;
  /** Number of unacknowledged anomalies */
  unacknowledged: number;
  /** Count by severity */
  bySeverity: Record<string, number>;
  /** Count by type */
  byType: Record<string, number>;
  /** Most common anomaly type */
  mostCommonType: string;
  /** Most common severity */
  mostCommonSeverity: string;
}

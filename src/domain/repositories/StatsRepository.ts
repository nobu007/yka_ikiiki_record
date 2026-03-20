import { Stats } from "../entities/Stats";

/**
 * Repository interface for stats data persistence and retrieval.
 *
 * Defines the contract for storing and fetching student emotion statistics.
 * Implementations can use different storage backends (in-memory, database, etc.)
 * while maintaining a consistent interface for domain services.
 *
 * @example
 * ```ts
 * class MockStatsRepository implements StatsRepository {
 *   async getStats(): Promise<Stats> {
 *     return { overview: { count: 100, avgEmotion: 50 }, ... };
 *   }
 *   async saveStats(stats: Stats): Promise<void> {
 *     this.storage = stats;
 *   }
 *   async generateSeedData(): Promise<void> {
 *     // Generate synthetic data
 *   }
 * }
 * ```
 */
export interface StatsRepository {
  /**
   * Retrieves current statistics from the repository.
   *
   * @returns Promise resolving to Stats object containing all aggregations.
   */
  getStats(): Promise<Stats>;

  /**
   * Persists statistics to the repository.
   *
   * @param stats - Stats object to store.
   * @returns Promise that resolves when save operation completes.
   */
  saveStats(stats: Stats): Promise<void>;

  /**
   * Generates synthetic seed data for testing and demonstration.
   *
   * Creates realistic emotion data and stores it in the repository.
   * This is a convenience method combining data generation and storage.
   *
   * @returns Promise that resolves when data generation completes.
   */
  generateSeedData(): Promise<void>;
}

import type { NotificationProvider, NotificationChannel, NotificationProviderType, NotificationProviderStatus } from "@/domain/entities/NotificationProvider";

/**
 * Repository interface for NotificationProvider persistence and retrieval.
 *
 * Provides CRUD operations for managing notification providers.
 * Following Clean Architecture, this is a domain interface that
 * defines the contract for infrastructure implementations.
 *
 * @example
 * ```ts
 * // In-memory implementation for testing
 * class InMemoryNotificationProviderRepository implements NotificationProviderRepository {
 *   private providers: Map<string, NotificationProvider> = new Map();
 *   // ... implementation
 * }
 *
 * // Database implementation for production
 * class PrismaNotificationProviderRepository implements NotificationProviderRepository {
 *   constructor(private prisma: PrismaClient) {}
 *   // ... implementation
 * }
 * ```
 */
export interface NotificationProviderRepository {
  /**
   * Save a new notification provider or update an existing one
   *
   * @param provider - The notification provider to save
   * @returns The saved provider with generated ID if new
   * @throws {Error} If save operation fails
   */
  save(provider: NotificationProvider): Promise<NotificationProvider>;

  /**
   * Find a notification provider by its unique identifier
   *
   * @param id - The provider ID to find
   * @returns The provider if found, undefined otherwise
   */
  findById(id: string): Promise<NotificationProvider | undefined>;

  /**
   * Find all notification providers, optionally filtered by criteria
   *
   * @param options - Optional filter and pagination options
   * @returns Array of providers matching the criteria
   */
  findAll(options?: NotificationProviderFilterOptions): Promise<NotificationProvider[]>;

  /**
   * Find notification providers by type
   *
   * @param type - The provider type to filter by
   * @returns Array of providers with the specified type
   */
  findByType(type: NotificationProviderType): Promise<NotificationProvider[]>;

  /**
   * Find notification providers by status
   *
   * @param status - The status to filter by
   * @returns Array of providers with the specified status
   */
  findByStatus(status: NotificationProviderStatus): Promise<NotificationProvider[]>;

  /**
   * Find notification providers that support a specific channel
   *
   * @param channel - The channel to filter by
   * @returns Array of providers that support the channel
   */
  findByChannel(channel: NotificationChannel): Promise<NotificationProvider[]>;

  /**
   * Find all active notification providers
   *
   * @returns Array of active providers
   */
  findActiveProviders(): Promise<NotificationProvider[]>;

  /**
   * Find notification providers that have a specific channel enabled
   *
   * @param channel - The channel to filter by
   * @returns Array of providers with the channel enabled
   */
  findProvidersByChannel(channel: NotificationChannel): Promise<NotificationProvider[]>;

  /**
   * Update the status of a notification provider
   *
   * @param id - The provider ID to update
   * @param status - The new status
   * @returns The updated provider if found, undefined otherwise
   */
  updateStatus(id: string, status: NotificationProviderStatus): Promise<NotificationProvider | undefined>;

  /**
   * Update the last used timestamp of a notification provider
   *
   * @param id - The provider ID to update
   * @param lastUsedAt - The timestamp of last usage
   * @returns The updated provider if found, undefined otherwise
   */
  updateLastUsed(id: string, lastUsedAt: Date): Promise<NotificationProvider | undefined>;

  /**
   * Delete a notification provider by ID
   *
   * @param id - The provider ID to delete
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get notification provider statistics
   *
   * @returns Statistical summary of notification providers
   */
  getStatistics(): Promise<NotificationProviderStatistics>;
}

/**
 * Filter options for finding notification providers
 */
export interface NotificationProviderFilterOptions {
  /** Filter by provider type */
  type?: NotificationProviderType;
  /** Filter by status */
  status?: NotificationProviderStatus;
  /** Filter by channel */
  channel?: NotificationChannel;
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort by field (default: createdAt) */
  sortBy?: keyof NotificationProvider | "createdAt";
  /** Sort order (default: desc) */
  sortOrder?: "asc" | "desc";
}

/**
 * Notification provider statistics summary
 */
export interface NotificationProviderStatistics {
  /** Total number of providers */
  total: number;
  /** Number of active providers */
  active: number;
  /** Number of inactive providers */
  inactive: number;
  /** Number of suspended providers */
  suspended: number;
  /** Count by type */
  byType: Record<string, number>;
  /** Count by channel */
  byChannel: Record<string, number>;
  /** Most commonly used provider type */
  mostUsedType: string;
  /** Most commonly used channel */
  mostUsedChannel: string;
}

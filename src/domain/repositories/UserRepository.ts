import { User } from "@/domain/entities/User";

/**
 * Repository interface for user persistence and authentication.
 *
 * Defines CRUD operations for user accounts with support for
 * authentication queries (findByEmail) and role-based access.
 *
 * @example
 * ```ts
 * class PrismaUserRepository implements UserRepository {
 *   async findByEmail(email: string): Promise<User | null> {
 *     return await prisma.user.findUnique({ where: { email } });
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface UserRepository {
  /**
   * Finds a user by their email address.
   *
   * This is the primary method for authentication lookups.
   * Email addresses should be case-insensitive for comparison.
   *
   * @param email - User's email address.
   * @returns Promise resolving to the user or null if not found.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a single user by their ID.
   *
   * @param id - Unique identifier of the user.
   * @returns Promise resolving to the user or null if not found.
   */
  findById(id: number): Promise<User | null>;

  /**
   * Retrieves all users from the repository.
   *
   * @returns Promise resolving to array of all users.
   */
  findAll(): Promise<User[]>;

  /**
   * Finds users by their role.
   *
   * @param role - User role (TEACHER or ADMIN).
   * @returns Promise resolving to array of users with the specified role.
   */
  findByRole(role: "TEACHER" | "ADMIN"): Promise<User[]>;

  /**
   * Saves a user (create or update).
   *
   * If the user has an ID, updates the existing user.
   * If the user does not have an ID, creates a new user.
   *
   * @param user - User to save.
   * @returns Promise resolving to the saved user.
   */
  save(user: User): Promise<User>;

  /**
   * Deletes a user by ID.
   *
   * @param id - Unique identifier of the user to delete.
   * @returns Promise that resolves when deletion completes.
   */
  delete(id: number): Promise<void>;

  /**
   * Counts total number of users in the repository.
   *
   * @returns Promise resolving to the count.
   */
  count(): Promise<number>;

  /**
   * Checks if an email address is already registered.
   *
   * @param email - Email address to check.
   * @returns Promise resolving to true if email exists, false otherwise.
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Disconnects from the data source and releases resources.
   *
   * Implementations should close database connections, clear caches,
   * and perform any necessary cleanup. This method should be called
   * when the repository instance is no longer needed.
   *
   * @returns Promise that resolves when disconnection completes.
   */
  disconnect(): Promise<void>;
}

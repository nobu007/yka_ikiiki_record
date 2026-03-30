import { UserRepository } from "@/domain/repositories/UserRepository";
import { User } from "@/domain/entities/User";
import { UserSchema } from "@/schemas/api";
import { ValidationError } from "@/lib/error-handler";
import { globalLogger } from "@/lib/resilience";

/**
 * In-memory implementation of UserRepository for testing and development.
 *
 * Stores users in a JavaScript Map, providing fast in-memory operations
 * without requiring a database connection. Suitable for unit tests and
 * development environments.
 *
 * @example
 * ```ts
 * const repository = new InMemoryUserRepository();
 * await repository.save({
 *   email: "teacher@example.com",
 *   passwordHash: "$2b$10$...",
 *   name: "田中先生",
 *   role: "TEACHER"
 * });
 * ```
 */
export class InMemoryUserRepository implements UserRepository {
  private users: Map<number, User>;
  private nextId: number;

  constructor() {
    this.users = new Map();
    this.nextId = 1;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();

    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }

    return null;
  }

  async findById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findByRole(role: "TEACHER" | "ADMIN"): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.role === role);
  }

  async save(user: User): Promise<User> {
    const validationResult = UserSchema.safeParse(user);
    if (!validationResult.success) {
      globalLogger.error("IN_MEMORY_USER_REPOSITORY", "VALIDATION_ERROR", {
        error: "Attempted to save invalid user",
        validationErrors: validationResult.error.errors,
        data: user,
      });
      throw new ValidationError(
        `Cannot save invalid user: ${validationResult.error.errors.map((e) => e.message).join(", ")}`,
        { validationErrors: validationResult.error.errors, user },
      );
    }

    if (user.id !== undefined) {
      const existing = this.users.get(user.id);
      if (existing) {
        const updated: User = {
          ...validationResult.data,
          id: user.id,
          updatedAt: new Date(),
        };
        this.users.set(user.id, updated);
        return updated;
      }
    }

    const newId = this.nextId++;
    const now = new Date();
    const newUser: User = {
      ...validationResult.data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(newId, newUser);
    return newUser;
  }

  async delete(id: number): Promise<void> {
    this.users.delete(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  async disconnect(): Promise<void> {
    this.users.clear();
    this.nextId = 1;
  }
}

import { PrismaClient } from "@prisma/client";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { User } from "@/domain/entities/User";
import { UserSchema } from "@/schemas/api";
import { withDatabaseTimeout } from "@/lib/resilience/timeout";
import { globalLogger } from "@/lib/resilience";
import { ValidationError } from "@/lib/error-handler";

/**
 * Prisma-based implementation of UserRepository for production use.
 *
 * Uses PostgreSQL for persistent user storage with support for
 * authentication queries and role-based access control.
 *
 * @example
 * ```ts
 * const repository = new PrismaUserRepository();
 * const user = await repository.findByEmail("teacher@example.com");
 * ```
 */
export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;
  private shouldDisconnect: boolean;

  constructor(prisma?: PrismaClient) {
    this.shouldDisconnect = !prisma;
    this.prisma = prisma || new PrismaClient();
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await withDatabaseTimeout(
      this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      }),
    );

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findById(id: number): Promise<User | null> {
    const user = await withDatabaseTimeout(
      this.prisma.user.findUnique({
        where: { id },
      }),
    );

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await withDatabaseTimeout(
      this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      }),
    );

    return users.map((user) => this.toDomain(user));
  }

  async findByRole(role: "TEACHER" | "ADMIN"): Promise<User[]> {
    const users = await withDatabaseTimeout(
      this.prisma.user.findMany({
        where: { role },
        orderBy: { createdAt: "desc" },
      }),
    );

    return users.map((user) => this.toDomain(user));
  }

  async save(user: User): Promise<User> {
    const validationResult = UserSchema.safeParse(user);
    if (!validationResult.success) {
      globalLogger.error("PRISMA_USER_REPOSITORY", "VALIDATION_ERROR", {
        error: "Attempted to save invalid user",
        validationErrors: validationResult.error.errors,
        data: user,
      });
      throw new ValidationError(
        `Cannot save invalid user: ${validationResult.error.errors.map((e) => e.message).join(", ")}`,
        { validationErrors: validationResult.error.errors, user },
      );
    }

    const data = this.toPrisma(validationResult.data);

    if (user.id !== undefined) {
      const updated = await withDatabaseTimeout(
        this.prisma.user.update({
          where: { id: user.id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        }),
      );

      return this.toDomain(updated);
    }

    const created = await withDatabaseTimeout(
      this.prisma.user.create({
        data: {
          ...data,
          email: data.email.toLowerCase(),
        },
      }),
    );

    return this.toDomain(created);
  }

  async delete(id: number): Promise<void> {
    await withDatabaseTimeout(
      this.prisma.user.delete({
        where: { id },
      }),
    );
  }

  async count(): Promise<number> {
    return withDatabaseTimeout(this.prisma.user.count());
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await withDatabaseTimeout(
      this.prisma.user.count({
        where: { email: email.toLowerCase() },
      }),
    );

    return count > 0;
  }

  async disconnect(): Promise<void> {
    if (this.shouldDisconnect) {
      await withDatabaseTimeout(this.prisma.$disconnect());
    }
  }

  private toDomain(prismaUser: {
    id: number;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      name: prismaUser.name,
      role: prismaUser.role as "TEACHER" | "ADMIN",
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  private toPrisma(user: User): {
    email: string;
    passwordHash: string;
    name: string;
    role: string;
  } {
    return {
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role,
    };
  }
}

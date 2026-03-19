import { PrismaClient } from "@prisma/client";
import { IRecordRepository } from "@/domain/repositories/IRecordRepository";
import { Record } from "@/domain/entities/Record";
import { RecordSchema } from "@/schemas/api";
import { withDatabaseTimeout } from "@/lib/resilience/timeout";
import { DATABASE_CONSTRAINTS } from "@/lib/constants";
import { globalLogger } from "@/lib/resilience";

export class PrismaRecordRepository implements IRecordRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async findById(id: number): Promise<Record | null> {
    const record = await withDatabaseTimeout(
      this.prisma.record.findUnique({
        where: { id },
      }),
    );

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(): Promise<Record[]> {
    const records = await withDatabaseTimeout(
      this.prisma.record.findMany({
        orderBy: { date: "desc" },
      }),
    );

    return records.map((record) => this.toDomain(record));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Record[]> {
    const records = await withDatabaseTimeout(
      this.prisma.record.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "desc" },
      }),
    );

    return records.map((record) => this.toDomain(record));
  }

  async findByStudent(student: string): Promise<Record[]> {
    const records = await withDatabaseTimeout(
      this.prisma.record.findMany({
        where: { student },
        orderBy: { date: "desc" },
      }),
    );

    return records.map((record) => this.toDomain(record));
  }

  async save(record: Record): Promise<Record> {
    const validationResult = RecordSchema.safeParse(record);
    if (!validationResult.success) {
      globalLogger.error("PRISMA_REPOSITORY", "VALIDATION_ERROR", {
        error: "Attempted to save invalid record",
        validationErrors: validationResult.error.errors,
        data: record,
      });
      throw new Error(
        `Cannot save invalid record: ${validationResult.error.errors.map((e) => e.message).join(", ")}`,
      );
    }

    const data = this.toPrisma(validationResult.data);
    const recordData = {
      ...data,
      comment: data.comment || null,
    };

    const saved = await withDatabaseTimeout(
      this.prisma.record.upsert({
        where: { id: record.id || DATABASE_CONSTRAINTS.ID_FALLBACK },
        update: recordData,
        create: recordData,
      }),
    );

    return this.toDomain(saved);
  }

  async saveMany(records: Record[]): Promise<Record[]> {
    await withDatabaseTimeout(
      this.prisma.record.createMany({
        data: records.map((record) => this.toPrisma(record)),
      }),
    );

    const createdRecords = await withDatabaseTimeout(
      this.prisma.record.findMany({
        where: {
          id: {
            in: records
              .map((r) => r.id)
              .filter((id): id is number => id !== undefined),
          },
        },
      }),
    );

    return createdRecords.map((record) => this.toDomain(record));
  }

  async delete(id: number): Promise<void> {
    await withDatabaseTimeout(
      this.prisma.record.delete({
        where: { id },
      }),
    );
  }

  async deleteAll(): Promise<void> {
    await withDatabaseTimeout(this.prisma.record.deleteMany({}));
  }

  async count(): Promise<number> {
    return withDatabaseTimeout(this.prisma.record.count());
  }

  private toDomain(prismaRecord: {
    id: number;
    emotion: number;
    date: Date;
    student: string;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Record {
    const result: Record = {
      id: prismaRecord.id,
      emotion: prismaRecord.emotion,
      date: prismaRecord.date,
      student: prismaRecord.student,
      createdAt: prismaRecord.createdAt,
      updatedAt: prismaRecord.updatedAt,
    };

    if (prismaRecord.comment !== null) {
      result.comment = prismaRecord.comment;
    }

    return result;
  }

  private toPrisma(record: Record): {
    id?: number;
    emotion: number;
    date: Date;
    student: string;
    comment?: string;
  } {
    const result: {
      id?: number;
      emotion: number;
      date: Date;
      student: string;
      comment?: string;
    } = {
      emotion: record.emotion,
      date: record.date,
      student: record.student,
    };

    if (record.id !== undefined) {
      result.id = record.id;
    }

    if (record.comment !== undefined) {
      result.comment = record.comment;
    }

    return result;
  }
}

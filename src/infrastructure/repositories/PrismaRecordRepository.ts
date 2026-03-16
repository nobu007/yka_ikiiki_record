import { PrismaClient } from '@prisma/client';
import { IRecordRepository } from '@/domain/repositories/IRecordRepository';
import { Record } from '@/domain/entities/Record';

export class PrismaRecordRepository implements IRecordRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async findById(id: number): Promise<Record | null> {
    const record = await this.prisma.record.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(): Promise<Record[]> {
    const records = await this.prisma.record.findMany({
      orderBy: { date: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Record[]> {
    const records = await this.prisma.record.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findByStudent(student: string): Promise<Record[]> {
    const records = await this.prisma.record.findMany({
      where: { student },
      orderBy: { date: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async save(record: Record): Promise<Record> {
    const data = this.toPrisma(record);

    const saved = await this.prisma.record.upsert({
      where: { id: record.id || 0 },
      update: {
        emotion: data.emotion,
        date: data.date,
        student: data.student,
        comment: data.comment || null,
      },
      create: {
        emotion: data.emotion,
        date: data.date,
        student: data.student,
        comment: data.comment || null,
      },
    });

    return this.toDomain(saved);
  }

  async saveMany(records: Record[]): Promise<Record[]> {
    await this.prisma.record.createMany({
      data: records.map((record) => this.toPrisma(record)),
    });

    const createdRecords = await this.prisma.record.findMany({
      where: {
        id: { in: records.map((r) => r.id).filter((id): id is number => id !== undefined) },
      },
    });

    return createdRecords.map((record) => this.toDomain(record));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.record.delete({
      where: { id },
    });
  }

  async deleteAll(): Promise<void> {
    await this.prisma.record.deleteMany({});
  }

  async count(): Promise<number> {
    return this.prisma.record.count();
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

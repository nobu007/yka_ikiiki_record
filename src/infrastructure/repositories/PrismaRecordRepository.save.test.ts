import { setupTest } from "./PrismaRecordRepository.setup";
import { Record } from "@/domain/entities/Record";

describe("PrismaRecordRepository - save", () => {
  let repository: ReturnType<typeof setupTest>["repository"];
  let prisma: ReturnType<typeof setupTest>["prisma"];

  beforeAll(() => {
    const setup = setupTest();
    repository = setup.repository;
    prisma = setup.prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("save", () => {
    it("should create a new record without id", async () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedPrismaRecord = {
        id: 1,
        ...record,
        comment: null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      const saved = await repository.save(record);

      expect(saved.id).toBeDefined();
      expect(saved.emotion).toBe(record.emotion);
      expect(saved.student).toBe(record.student);
      expect(saved.date).toEqual(record.date);
      expect(prisma.record.upsert).toHaveBeenCalledWith({
        where: { id: 0 },
        create: {
          emotion: record.emotion,
          date: record.date,
          student: record.student,
          comment: null,
        },
        update: {
          emotion: record.emotion,
          date: record.date,
          student: record.student,
          comment: null,
        },
      });
    });

    it("should create a new record with comment", async () => {
      const record: Record = {
        emotion: 4.0,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生2",
        comment: "今日は充実した一日でした",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedPrismaRecord = {
        id: 2,
        emotion: record.emotion,
        date: record.date,
        student: record.student,
        comment: record.comment,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      const saved = await repository.save(record);

      expect(saved.comment).toBe(record.comment);
    });

    it("should update an existing record with id", async () => {
      const existingRecord = {
        id: 1,
        emotion: 3.0,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生3",
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRecord: Record = {
        id: 1,
        emotion: 4.5,
        date: new Date("2024-01-16T11:00:00"),
        student: "学生3",
        comment: "更新されたコメント",
        createdAt: existingRecord.createdAt,
        updatedAt: new Date(),
      };

      const savedPrismaRecord = {
        ...updatedRecord,
        comment: updatedRecord.comment || null,
      };

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      const saved = await repository.save(updatedRecord);

      expect(saved.id).toBe(1);
      expect(saved.emotion).toBe(4.5);
      expect(saved.comment).toBe("更新されたコメント");
      expect(prisma.record.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: expect.objectContaining({
          emotion: 4.5,
        }),
        update: expect.objectContaining({
          emotion: 4.5,
          comment: "更新されたコメント",
        }),
      });
    });

    it("should handle undefined comment when saving", async () => {
      const record: Record = {
        emotion: 3.5,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生4",
        // Omit comment property entirely instead of setting to undefined
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedPrismaRecord = {
        id: 4,
        ...record,
        comment: null,
      };

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      const saved = await repository.save(record);

      expect(saved.comment).toBeUndefined();
      expect(prisma.record.upsert).toHaveBeenCalledWith({
        where: { id: 0 },
        create: expect.objectContaining({ comment: null }),
        update: expect.objectContaining({ comment: null }),
      });
    });
  });

  describe("saveMany", () => {
    it("should save multiple records", async () => {
      const records: Record[] = [
        {
          emotion: 4.0,
          date: new Date("2024-01-15T10:00:00"),
          student: "学生1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 4.5,
          date: new Date("2024-01-15T11:00:00"),
          student: "学生2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.record.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const createdRecords = records.map((r, i) => ({
        id: i + 1,
        ...r,
        comment: null,
      }));

      (prisma.record.findMany as jest.Mock).mockResolvedValue(createdRecords);

      const saved = await repository.saveMany(records);

      expect(saved).toHaveLength(2);
      expect(prisma.record.createMany).toHaveBeenCalledWith({
        data: records.map((r) =>
          expect.objectContaining({
            emotion: r.emotion,
            student: r.student,
          }),
        ),
      });
    });

    it("should handle empty array", async () => {
      (prisma.record.createMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.record.findMany as jest.Mock).mockResolvedValue([]);

      const saved = await repository.saveMany([]);

      expect(saved).toHaveLength(0);
      expect(prisma.record.createMany).toHaveBeenCalledWith({
        data: [],
      });
    });

    it("should save records with and without comments", async () => {
      const records: Record[] = [
        {
          emotion: 3.5,
          date: new Date("2024-01-15T10:00:00"),
          student: "学生1",
          comment: "コメントあり",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 4.0,
          date: new Date("2024-01-15T11:00:00"),
          student: "学生2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.record.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const createdRecords = records.map((r, i) => ({
        id: i + 1,
        ...r,
        comment: r.comment || null,
      }));

      (prisma.record.findMany as jest.Mock).mockResolvedValue(createdRecords);

      const saved = await repository.saveMany(records);

      expect(saved).toHaveLength(2);
    });

    it("should throw error when saving invalid record", async () => {
      const invalidRecord = {
        emotion: 10,
        date: "invalid-date" as unknown as Date,
        student: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(repository.save(invalidRecord)).rejects.toThrow(
        "Cannot save invalid record",
      );
    });

    it("should throw error with validation details when saving invalid record", async () => {
      const invalidRecord = {
        emotion: -1,
        date: new Date("2024-01-15"),
        student: "学生1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(repository.save(invalidRecord)).rejects.toThrow();
    });

    it("should throw error when saving multiple invalid records", async () => {
      const invalidRecords: Record[] = [
        {
          emotion: 10,
          date: new Date("2024-01-15"),
          student: "学生1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: -1,
          date: new Date("2024-01-16"),
          student: "学生2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await expect(repository.saveMany(invalidRecords)).rejects.toThrow(
        "Cannot save invalid records",
      );
    });

    it("should include error count in validation error message", async () => {
      const records: Record[] = [
        {
          emotion: 4.0,
          date: new Date("2024-01-15"),
          student: "学生1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 10,
          date: new Date("2024-01-16"),
          student: "学生2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await expect(repository.saveMany(records)).rejects.toThrow(
        "1 of 2 records failed validation",
      );
    });
  });
});

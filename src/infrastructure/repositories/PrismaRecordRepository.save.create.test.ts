import { setupTest } from "./PrismaRecordRepository.setup";
import { Record } from "@/domain/entities/Record";

describe("PrismaRecordRepository - save (create operations)", () => {
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

  describe("save - create new records", () => {
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

    it("should handle undefined comment when saving", async () => {
      const record: Record = {
        emotion: 3.5,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生4",
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
});

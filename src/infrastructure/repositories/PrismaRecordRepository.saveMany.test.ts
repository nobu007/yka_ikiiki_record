import { setupTest } from "./PrismaRecordRepository.setup";
import { Record } from "@/domain/entities/Record";

describe("PrismaRecordRepository - saveMany", () => {
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

  describe("saveMany - bulk operations", () => {
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
  });
});

describe("PrismaRecordRepository - saveMany validation", () => {
  let repository: ReturnType<typeof setupTest>["repository"];

  beforeAll(() => {
    const setup = setupTest();
    repository = setup.repository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("saveMany - error handling", () => {
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

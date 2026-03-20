import { setupTest } from "./PrismaRecordRepository.setup";
import { Record } from "@/domain/entities/Record";

describe("PrismaRecordRepository - save (update operations)", () => {
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

  describe("save - update existing records", () => {
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
  });
});

import { setupTest } from "./PrismaRecordRepository.setup";

describe("PrismaRecordRepository - count", () => {
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

  describe("count", () => {
    it("should return count of all records", async () => {
      (prisma.record.count as jest.Mock).mockResolvedValue(2);

      const count = await repository.count();

      expect(count).toBe(2);
      expect(prisma.record.count).toHaveBeenCalled();
    });

    it("should return zero when no records exist", async () => {
      (prisma.record.count as jest.Mock).mockResolvedValue(0);

      const count = await repository.count();

      expect(count).toBe(0);
    });
  });
});

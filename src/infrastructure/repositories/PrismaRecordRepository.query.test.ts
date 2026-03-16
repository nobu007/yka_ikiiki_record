import { setupTest } from './PrismaRecordRepository.setup';

describe('PrismaRecordRepository - query', () => {
  let repository: ReturnType<typeof setupTest>['repository'];
  let prisma: ReturnType<typeof setupTest>['prisma'];

  beforeAll(() => {
    const setup = setupTest();
    repository = setup.repository;
    prisma = setup.prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find record by id', async () => {
      const prismaRecord = {
        id: 1,
        emotion: 85.5,
        date: new Date('2024-01-15T10:30:00'),
        student: '学生1',
        comment: 'テストコメント',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.record.findUnique as jest.Mock).mockResolvedValue(prismaRecord);

      const found = await repository.findById(1);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(1);
      expect(found?.emotion).toBe(85.5);
      expect(found?.student).toBe('学生1');
      expect(found?.comment).toBe('テストコメント');
      expect(prisma.record.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when record does not exist', async () => {
      (prisma.record.findUnique as jest.Mock).mockResolvedValue(null);

      const found = await repository.findById(99999);

      expect(found).toBeNull();
    });

    it('should return record without comment', async () => {
      const prismaRecord = {
        id: 2,
        emotion: 75.0,
        date: new Date('2024-01-15T10:30:00'),
        student: '学生2',
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.record.findUnique as jest.Mock).mockResolvedValue(prismaRecord);

      const found = await repository.findById(2);

      expect(found?.comment).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all records ordered by date descending', async () => {
      const prismaRecords = [
        {
          id: 2,
          emotion: 85.0,
          date: new Date('2024-01-15T11:00:00'),
          student: '学生2',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          emotion: 75.0,
          date: new Date('2024-01-12T12:00:00'),
          student: '学生3',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          emotion: 80.0,
          date: new Date('2024-01-10T10:00:00'),
          student: '学生1',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.record.findMany as jest.Mock).mockResolvedValue(prismaRecords);

      const records = await repository.findAll();

      expect(records).toHaveLength(3);
      expect(records[0].student).toBe('学生2');
      expect(records[1].student).toBe('学生3');
      expect(records[2].student).toBe('学生1');
      expect(prisma.record.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' },
      });
    });

    it('should return empty array when no records exist', async () => {
      (prisma.record.findMany as jest.Mock).mockResolvedValue([]);

      const records = await repository.findAll();

      expect(records).toHaveLength(0);
    });

    it('should include records with and without comments', async () => {
      const prismaRecords = [
        {
          id: 2,
          emotion: 85.0,
          date: new Date('2024-01-16T11:00:00'),
          student: '学生2',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          emotion: 80.0,
          date: new Date('2024-01-15T10:00:00'),
          student: '学生1',
          comment: 'コメントあり',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.record.findMany as jest.Mock).mockResolvedValue(prismaRecords);

      const records = await repository.findAll();

      expect(records).toHaveLength(2);
      expect(records[0].comment).toBeUndefined();
      expect(records[1].comment).toBe('コメントあり');
    });
  });

  describe('findByDateRange', () => {
    it('should find records within date range inclusive', async () => {
      const startDate = new Date('2024-01-15T00:00:00');
      const endDate = new Date('2024-01-20T23:59:59');

      const prismaRecords = [
        {
          id: 1,
          emotion: 85.0,
          date: new Date('2024-01-15T11:00:00'),
          student: '学生2',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          emotion: 75.0,
          date: new Date('2024-01-20T12:00:00'),
          student: '学生3',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.record.findMany as jest.Mock).mockResolvedValue(prismaRecords);

      const records = await repository.findByDateRange(startDate, endDate);

      expect(records).toHaveLength(2);
      expect(prisma.record.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
      });
    });

    it('should return empty array when no records in range', async () => {
      const startDate = new Date('2024-02-01T00:00:00');
      const endDate = new Date('2024-02-28T23:59:59');

      (prisma.record.findMany as jest.Mock).mockResolvedValue([]);

      const records = await repository.findByDateRange(startDate, endDate);

      expect(records).toHaveLength(0);
    });
  });

  describe('findByStudent', () => {
    it('should find records by student name', async () => {
      const prismaRecords = [
        {
          id: 2,
          emotion: 85.0,
          date: new Date('2024-01-16T11:00:00'),
          student: '学生1',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          emotion: 80.0,
          date: new Date('2024-01-15T10:00:00'),
          student: '学生1',
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.record.findMany as jest.Mock).mockResolvedValue(prismaRecords);

      const records = await repository.findByStudent('学生1');

      expect(records).toHaveLength(2);
      expect(records.every((r: any) => r.student === '学生1')).toBe(true);
      expect(prisma.record.findMany).toHaveBeenCalledWith({
        where: { student: '学生1' },
        orderBy: { date: 'desc' },
      });
    });

    it('should return empty array for non-existent student', async () => {
      (prisma.record.findMany as jest.Mock).mockResolvedValue([]);

      const records = await repository.findByStudent('存在しない学生');

      expect(records).toHaveLength(0);
    });
  });
});

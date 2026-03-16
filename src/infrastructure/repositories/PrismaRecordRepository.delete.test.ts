import { setupTest } from './PrismaRecordRepository.setup';

describe('PrismaRecordRepository - delete', () => {
  let repository: any;
  let prisma: any;

  beforeAll(() => {
    const setup = setupTest();
    repository = setup.repository;
    prisma = setup.prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('delete', () => {
    it('should delete record by id', async () => {
      (prisma.record.delete as jest.Mock).mockResolvedValue({
        id: 1,
        emotion: 85.0,
        date: new Date('2024-01-15T10:30:00'),
        student: '学生1',
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.delete(1);

      expect(prisma.record.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error when deleting non-existent record', async () => {
      const error = new Error('Record not found');
      (prisma.record.delete as jest.Mock).mockRejectedValue(error);

      await expect(repository.delete(99999)).rejects.toThrow();
    });
  });

  describe('deleteAll', () => {
    it('should delete all records', async () => {
      (prisma.record.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      await repository.deleteAll();

      expect(prisma.record.deleteMany).toHaveBeenCalledWith({});
    });

    it('should handle empty database', async () => {
      (prisma.record.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(repository.deleteAll()).resolves.not.toThrow();
    });
  });
});

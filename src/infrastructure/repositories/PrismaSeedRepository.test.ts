import { generateSeedData } from './PrismaSeedRepository';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    record: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  },
}));

describe('PrismaSeedRepository', () => {
  let mockPrisma: any;

  beforeAll(() => {
    mockPrisma = prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSeedData', () => {
    it('should generate exactly 750 records', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});
      (mockPrisma.record.createMany as jest.Mock).mockResolvedValue({ count: 750 });

      const count = await generateSeedData();

      expect(count).toBe(750);
      expect(mockPrisma.record.deleteMany).toHaveBeenCalledWith({});
      expect(mockPrisma.record.createMany).toHaveBeenCalledWith({
        data: expect.any(Array),
      });
    });

    it('should clear existing data before generating', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});
      (mockPrisma.record.createMany as jest.Mock).mockResolvedValue({ count: 750 });

      await generateSeedData();

      expect(mockPrisma.record.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.record.createMany).toHaveBeenCalled();
    });

    it('should generate records with valid emotion values', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});

      let capturedData: any[] = [];
      (mockPrisma.record.createMany as jest.Mock).mockImplementation(({ data }: { data: any[] }) => {
        capturedData = data;
        return Promise.resolve({ count: data.length });
      });

      await generateSeedData();

      expect(capturedData.length).toBe(750);
      expect(capturedData.every((r: any) => r.emotion >= 1 && r.emotion <= 5)).toBe(true);
    });

    it('should generate records with dates within last 31 days', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});

      let capturedData: any[] = [];
      (mockPrisma.record.createMany as jest.Mock).mockImplementation(({ data }: { data: any[] }) => {
        capturedData = data;
        return Promise.resolve({ count: data.length });
      });

      await generateSeedData();

      const maxDate = new Date(Math.max(...capturedData.map((r: any) => r.date.getTime())));
      const minDate = new Date(Math.min(...capturedData.map((r: any) => r.date.getTime())));
      const daysDiff = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeLessThanOrEqual(31);
      expect(daysDiff).toBeGreaterThan(0);
    });

    it('should generate records with valid student names', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});

      let capturedData: any[] = [];
      (mockPrisma.record.createMany as jest.Mock).mockImplementation(({ data }: { data: any[] }) => {
        capturedData = data;
        return Promise.resolve({ count: data.length });
      });

      await generateSeedData();

      expect(capturedData.every((r: any) => r.student.startsWith('学生'))).toBe(true);

      const studentNumbers = capturedData.map((r: any) => parseInt(r.student.replace('学生', '')));
      expect(studentNumbers.every((n: number) => n >= 1 && n <= 25)).toBe(true);
    });

    it('should distribute students across records', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});

      let capturedData: any[] = [];
      (mockPrisma.record.createMany as jest.Mock).mockImplementation(({ data }: { data: any[] }) => {
        capturedData = data;
        return Promise.resolve({ count: data.length });
      });

      await generateSeedData();

      const uniqueStudents = new Set(capturedData.map((r: any) => r.student));

      expect(uniqueStudents.size).toBeGreaterThan(1);
      expect(uniqueStudents.size).toBeLessThanOrEqual(25);
    });

    it('should generate records with comments from predefined list', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});

      let capturedData: any[] = [];
      (mockPrisma.record.createMany as jest.Mock).mockImplementation(({ data }: { data: any[] }) => {
        capturedData = data;
        return Promise.resolve({ count: data.length });
      });

      await generateSeedData();

      const validComments = [
        '今日は充実した一日でした',
        '少し疲れました',
        'とても楽しかったです',
        '難しい課題に取り組みました',
        'チームでの作業が上手くいきました',
      ];

      const recordsWithComments = capturedData.filter((r: any) => r.comment !== null);

      expect(recordsWithComments.length).toBeGreaterThan(0);
      expect(recordsWithComments.every((r: any) => validComments.includes(r.comment))).toBe(true);
    });

    it('should include records with comments', async () => {
      (mockPrisma.record.deleteMany as jest.Mock).mockResolvedValue({});

      let capturedData: any[] = [];
      (mockPrisma.record.createMany as jest.Mock).mockImplementation(({ data }: { data: any[] }) => {
        capturedData = data;
        return Promise.resolve({ count: data.length });
      });

      await generateSeedData();

      const recordsWithComments = capturedData.filter((r: any) => r.comment !== null);

      expect(recordsWithComments.length).toBeGreaterThan(0);
      expect(capturedData.length).toBe(750);
    });
  });
});

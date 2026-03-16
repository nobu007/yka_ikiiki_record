import { PrismaStatsRepository } from './PrismaStatsRepository';
import { PrismaRecordRepository } from './PrismaRecordRepository';

jest.mock('./PrismaRecordRepository');

describe('PrismaStatsRepository.generateSeedData', () => {
  let repository: PrismaStatsRepository;
  let mockRecordRepository: jest.Mocked<PrismaRecordRepository>;

  beforeAll(() => {
    mockRecordRepository = new PrismaRecordRepository() as jest.Mocked<PrismaRecordRepository>;
    repository = new PrismaStatsRepository(mockRecordRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call generateSeedData from PrismaSeedRepository', async () => {
    const mockGenerateSeedData = jest.fn().mockResolvedValue(750);

    jest.doMock('./PrismaSeedRepository', () => ({
      generateSeedData: mockGenerateSeedData,
    }));

    await repository.generateSeedData();

    expect(mockGenerateSeedData).toHaveBeenCalled();
  });
});

import { DataGenerationConfig } from "@/domain/entities/DataGeneration";

export const createMockConfig = (
  overrides: Partial<DataGenerationConfig> = {},
): DataGenerationConfig => ({
  studentCount: 10,
  periodDays: 30,
  distributionPattern: "normal",
  seasonalEffects: false,
  eventEffects: [],
  classCharacteristics: {
    volatility: 0.5,
    baselineEmotion: 3.0,
    cohesion: 0.7,
  },
  ...overrides,
});

export const mockValidateDataSafe = jest.fn();

export const clearAllMocks = () => {
  jest.clearAllMocks();
  mockValidateDataSafe.mockImplementation((data: unknown) => [data, null]);
};

import { renderDashboardHook, executeHandleGenerate, expectDefaultState, expectSuccessState, clearAllMocks, mockSuccessResponse, createMockResponse, setupMockFetch } from './useDashboard.test.helpers';

global.fetch = jest.fn();

describe('useDashboard - Initialization and Happy Path', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderDashboardHook();

    expectDefaultState(result);
  });

  it('should handle successful data generation', async () => {
    setupMockFetch(createMockResponse(true, 200, 'OK', mockSuccessResponse));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expectSuccessState(result);
  });

  it('should send correct request payload', async () => {
    setupMockFetch(createMockResponse(true, 200, 'OK', mockSuccessResponse));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/seed'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"config"')
      })
    );
  });
});

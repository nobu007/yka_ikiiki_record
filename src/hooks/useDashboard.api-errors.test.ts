import { renderDashboardHook, executeHandleGenerate, expectErrorState, clearAllMocks, mockErrorResponse, createMockResponse, setupMockFetch } from './useDashboard.test.helpers';

global.fetch = jest.fn();

describe('useDashboard - API Error Handling', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  it('should handle API error response', async () => {
    setupMockFetch(createMockResponse(false, 500, 'Internal Server Error'));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expectErrorState(result);
  });

  it('should handle API response with success:false', async () => {
    setupMockFetch(createMockResponse(true, 200, 'OK', mockErrorResponse));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expectErrorState(result);
  });

  it('should handle API response with error message', async () => {
    const errorResponse = {
      success: false,
      error: 'Specific generation error',
      data: {
        overview: { count: 100, avgEmotion: 75.5 },
        monthlyStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [],
        timeOfDayStats: [],
        studentStats: []
      }
    };

    setupMockFetch(createMockResponse(true, 200, 'OK', errorResponse));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.type).toBe('error');
    expect(result.current.notification.message).toBeTruthy();
  });

  it('should handle API response with success:false and no error message', async () => {
    const errorResponse = {
      success: false
    };

    setupMockFetch(createMockResponse(true, 200, 'OK', errorResponse));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.type).toBe('error');
  });

  it('should handle 404 error', async () => {
    setupMockFetch(createMockResponse(false, 404, 'Not Found'));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expectErrorState(result);
  });
});

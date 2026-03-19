import { GET } from './route';
import { globalCircuitBreaker, globalMemoryMonitor } from '@/lib/resilience';

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalCircuitBreaker.reset();
  });

  test('returns healthy status when all systems operational', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.checks.api.status).toBe('pass');
    expect(data.checks.circuitBreaker.status).toBe('pass');
    expect(data.checks.memory.status).toBe('pass');
    expect(data.checks.database.status).toBe('pass');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeGreaterThan(0);
  });

  test('includes circuit breaker state in response', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.circuitBreaker).toHaveProperty('state');
    expect(data.checks.circuitBreaker).toHaveProperty('failureCount');
    expect(typeof data.checks.circuitBreaker.state).toBe('string');
    expect(typeof data.checks.circuitBreaker.failureCount).toBe('number');
  });

  test('includes memory metrics in response', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.memory).toHaveProperty('usagePercentage');
    expect(data.checks.memory).toHaveProperty('heapUsed');
    expect(data.checks.memory).toHaveProperty('heapTotal');
    expect(typeof data.checks.memory.usagePercentage).toBe('number');
    expect(typeof data.checks.memory.heapUsed).toBe('number');
    expect(typeof data.checks.memory.heapTotal).toBe('number');
  });

  test('includes database connection status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.database).toHaveProperty('provider');
    expect(data.checks.database).toHaveProperty('connected');
    expect(data.checks.database).toHaveProperty('status');
    expect(['mirage', 'prisma']).toContain(data.checks.database.provider);
  });

  test('includes API latency measurement', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.api).toHaveProperty('latency');
    expect(typeof data.checks.api.latency).toBe('number');
    expect(data.checks.api.latency).toBeGreaterThanOrEqual(0);
  });

  test('returns degraded status when memory usage is high', async () => {
    jest.spyOn(globalMemoryMonitor, 'getUsagePercentage').mockReturnValue(80);
    jest.spyOn(globalMemoryMonitor, 'getCurrentUsage').mockReturnValue({
      heapUsed: 400 * 1024 * 1024,
      heapTotal: 500 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0,
      rss: 0
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('degraded');
    expect(data.checks.memory.status).toBe('warn');
  });

  test('returns unhealthy status when memory usage is critical', async () => {
    jest.spyOn(globalMemoryMonitor, 'getUsagePercentage').mockReturnValue(95);
    jest.spyOn(globalMemoryMonitor, 'getCurrentUsage').mockReturnValue({
      heapUsed: 475 * 1024 * 1024,
      heapTotal: 500 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0,
      rss: 0
    });

    const response = await GET();
    const data = await response.json();

    expect(data.status).toBe('unhealthy');
    expect(data.checks.memory.status).toBe('fail');
    expect(data.checks.memory.usagePercentage).toBe(95);
  });

  test('returns degraded status when circuit breaker is open', async () => {
    jest.spyOn(globalCircuitBreaker, 'getState').mockReturnValue('OPEN');
    jest.spyOn(globalCircuitBreaker, 'getFailureCount').mockReturnValue(10);

    const response = await GET();
    const data = await response.json();

    expect(data.status).toMatch(/degraded|unhealthy/);
    expect(data.checks.circuitBreaker.status).toBe('fail');
    expect(data.checks.circuitBreaker.state).toBe('OPEN');
    expect(data.checks.circuitBreaker.failureCount).toBe(10);
  });

  test('includes current timestamp and uptime', async () => {
    const beforeTime = Date.now();
    const response = await GET();
    const afterTime = Date.now();
    const data = await response.json();

    expect(data.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(data.timestamp).toBeLessThanOrEqual(afterTime);
    expect(data.uptime).toBeGreaterThan(0);
  });
});

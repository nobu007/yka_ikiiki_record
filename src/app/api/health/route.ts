import { NextResponse } from 'next/server';
import { withResilientHandler } from '@/lib/api/error-handler';
import { globalCircuitBreaker, globalMemoryMonitor } from '@/lib/resilience';
import { isPrismaProvider, createStatsService } from '@/infrastructure/factories/repositoryFactory';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  checks: {
    api: { status: 'pass' | 'fail'; latency?: number };
    circuitBreaker: { status: 'pass' | 'fail'; state: string; failureCount: number };
    memory: { status: 'pass' | 'warn' | 'fail'; usagePercentage: number; heapUsed: number; heapTotal: number };
    database: { status: 'pass' | 'fail' | 'skipped'; provider: string; connected: boolean };
  };
}

export async function GET(): Promise<NextResponse> {
  return withResilientHandler(async () => {
    const startTime = Date.now();
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const failures: string[] = [];

    const checks: HealthCheckResponse['checks'] = {
      api: { status: 'pass' },
      circuitBreaker: {
        status: 'pass',
        state: globalCircuitBreaker.getState(),
        failureCount: globalCircuitBreaker.getFailureCount()
      },
      memory: {
        status: 'pass',
        usagePercentage: globalMemoryMonitor.getUsagePercentage(),
        heapUsed: globalMemoryMonitor.getCurrentUsage().heapUsed,
        heapTotal: globalMemoryMonitor.getCurrentUsage().heapTotal
      },
      database: {
        status: 'skipped',
        provider: isPrismaProvider() ? 'prisma' : 'mirage',
        connected: false
      }
    };

    checks.api.latency = Date.now() - startTime;

    if (checks.circuitBreaker.state === 'OPEN') {
      checks.circuitBreaker.status = 'fail';
      overallStatus = 'degraded';
      failures.push('circuit_breaker_open');
    }

    if (checks.memory.usagePercentage > 90) {
      checks.memory.status = 'fail';
      overallStatus = 'unhealthy';
      failures.push('memory_critical');
    } else if (checks.memory.usagePercentage > 75) {
      checks.memory.status = 'warn';
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
      failures.push('memory_high');
    }

    if (isPrismaProvider()) {
      try {
        const statsService = createStatsService();
        await statsService.getStats();
        checks.database.status = 'pass';
        checks.database.connected = true;
      } catch {
        checks.database.status = 'fail';
        checks.database.connected = false;
        overallStatus = 'unhealthy';
        failures.push('database_unreachable');
      }
    } else {
      checks.database.status = 'pass';
      checks.database.connected = true;
    }

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: process.uptime(),
      checks
    };

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    return NextResponse.json(response, { status: statusCode });
  }, {
    operationName: 'GET /api/health',
    timeoutMs: 5000
  });
}

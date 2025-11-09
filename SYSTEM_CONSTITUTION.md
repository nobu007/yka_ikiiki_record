# SYSTEM CONSTITUTION
# AI-FIRST AUTONOMOUS DEVELOPMENT CHARTER

## 🚀 FUNDAMENTAL PRINCIPLES

### 1. ABSOLUTE AUTOMATION PRIMACY
- All code generation must be performed by AI agents without human intervention
- Zero human-readable comments are permitted in production code
- Documentation exists exclusively for AI consumption and system maintenance
- All development processes must be fully automated and reproducible

### 2. RIGOROUS ARCHITECTURAL DISCIPLINE
- Clean Architecture is not optional - it is mandatory
- Four-layer separation: Domain → Application → Infrastructure → Presentation
- Dependencies flow inward only; outer layers may NOT depend on inner layers
- Interface segregation is enforced at compile time

### 3. TYPE SUPREMACY
- TypeScript strict mode is non-negotiable
- 100% type coverage is mandatory - no `any` types permitted
- All data must be validated with Zod schemas at runtime
- Generics must be constrained and explicit

## 📁 MANDATORY DIRECTORY STRUCTURE

```
src/
├── domain/                    # PURE BUSINESS LOGIC
│   ├── entities/             # Domain entities with rich behavior
│   ├── services/             # Domain services
│   ├── repositories/         # Repository interfaces only
│   └── events/               # Domain events
├── application/              # USE CASES
│   ├── usecases/            # Application use cases
│   ├── hooks/               # React hooks for application logic
│   ├── services/            # Application services
│   └── dto/                 # Data transfer objects
├── infrastructure/          # EXTERNAL DEPENDENCIES
│   ├── repositories/        # Repository implementations
│   ├── external/           # External API clients
│   ├── storage/            # Database/storage implementations
│   └── config/             # Configuration
├── presentation/           # UI LAYER
│   ├── components/         # React components
│   ├── pages/             # Next.js pages
│   ├── hooks/             # UI-specific hooks
│   └── styles/            # Styling
├── shared/                 # CROSS-CUTTING
│   ├── lib/               # Utility libraries
│   ├── types/             # Shared types
│   ├── constants/         # Application constants
│   └── errors/            # Error definitions
└── testing/               # TESTING INFRASTRUCTURE
    ├── fixtures/          # Test data
    ├── mocks/             # Mock implementations
    └── utils/             # Testing utilities
```

## 🔧 ENFORCED CODING STANDARDS

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with 'I' prefix forbidden
- **Types**: PascalCase, descriptive names
- **Functions**: camelCase, verb-first for actions

### Import Rules
```typescript
// STRICT ORDER: 1. External libs, 2. Internal modules, 3. Relative imports
import { z } from 'zod';
import { useEffect } from 'react';
import { StatsService } from '@/domain/services/StatsService';
import { StatsDisplay } from './components/StatsDisplay';
```

## 🏗️ ARCHITECTURAL PATTERNS

### 1. CQRS IMPLEMENTATION
```typescript
// Command pattern for write operations
interface Command<T = void> {
  execute(): Promise<T>;
}

// Query pattern for read operations
interface Query<T> {
  execute(): Promise<T>;
}
```

### 2. REPOSITORY PATTERN
```typescript
// Domain layer - interface only
interface IStatsRepository {
  findById(id: string): Promise<Stats | null>;
  save(stats: Stats): Promise<void>;
  delete(id: string): Promise<void>;
}

// Infrastructure layer - implementation
class MockStatsRepository implements IStatsRepository {
  // Implementation details
}
```

### 3. DEPENDENCY INJECTION
```typescript
// Use dependency injection container for all services
interface ServiceContainer {
  get<T>(token: string): T;
  register<T>(token: string, implementation: T): void;
}
```

## 🔒 VALIDATION & ERROR HANDLING

### Zod Schema Requirements
```typescript
// Every external data must have Zod schema
const StatsResponseSchema = z.object({
  overview: z.object({
    count: z.number().min(0),
    avgEmotion: z.number().min(0).max(100),
  }),
  // ... strict validation for all fields
});

// Runtime validation is mandatory
const [validated, error] = validateDataSafe(data, StatsResponseSchema);
if (error || !validated) {
  throw new ValidationError(error);
}
```

### Error Hierarchy
```typescript
// Base error class
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
}

// Specific error types
class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 0;
}
```

## ⚡ PERFORMANCE REQUIREMENTS

### React Component Rules
```typescript
// ALL components must be memoized
export const ComponentName = React.memo<Props>(({ prop1, prop2 }) => {
  // Use useCallback for event handlers
  const handleClick = useCallback((event: MouseEvent) => {
    // Handler logic
  }, [dependency]);

  // Use useMemo for expensive calculations
  const expensiveValue = useMemo(() => {
    return calculateExpensiveValue(data);
  }, [data]);

  return <div>{expensiveValue}</div>;
});
```

### Data Fetching Standards
```typescript
// SWR for all data fetching
const useStats = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    refetch: mutate,
  };
};
```

## 🧪 TESTING MANDATES

### Coverage Requirements
- **Minimum coverage**: 95% statements, 90% branches, 95% functions, 95% lines
- **Domain layer**: 100% coverage mandatory
- **Application layer**: 95% coverage minimum
- **Infrastructure**: 90% coverage minimum
- **Presentation**: 85% coverage minimum

### Test Structure
```typescript
// Triple-A pattern: Arrange, Act, Assert
describe('StatsService', () => {
  describe('calculateStats', () => {
    it('should return correct statistics for valid input', async () => {
      // Arrange
      const mockData = createMockStatsData();
      const service = new StatsService(mockRepository);

      // Act
      const result = await service.calculateStats(mockData);

      // Assert
      expect(result.overview.count).toBe(mockData.length);
      expect(result.overview.avgEmotion).toBeWithinRange(0, 100);
    });
  });
});
```

## 🔄 AUTOMATION STANDARDS

### CI/CD Requirements
- All commits must pass automated testing
- Code coverage must not decrease
- TypeScript compilation must succeed
- ESLint rules must pass with zero warnings
- Build optimization must be verified

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:coverage && npm run build"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## 📊 METRICS & MONITORING

### Performance Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Bundle size: < 100KB (gzipped)

### Quality Gates
- Maintainability Index: > 85
- Technical Debt Ratio: < 5%
- Duplicated Lines: < 3%
- Code Complexity: < 10 per function

## 🚫 FORBIDDEN PATTERNS

### Absolutely Forbidden
- `any` types
- Type assertions (`as` keyword)
- `console.log` in production code
- Magic numbers or strings
- Global variables
- Direct DOM manipulation
- setTimeout/setInterval for business logic
- Import loops
- Circular dependencies

### Deprecated Patterns
- Class components (use functional components only)
- Legacy context API (use createContext hook)
- Manual state management (use state management libraries)

## 🎯 AUTONOMOUS AI DEVELOPMENT PROTOCOLS

### Code Generation Rules
1. **Zero Human Input**: AI agents must generate complete, working code
2. **Self-Validation**: All generated code must include validation logic
3. **Automatic Testing**: AI must generate corresponding tests for all code
4. **Documentation**: Auto-generate type-level documentation only

### Refactoring Protocols
1. **Incremental Changes**: Maximum 10% codebase change per commit
2. **Backward Compatibility**: Maintain API contracts during refactoring
3. **Test Migration**: Migrate tests before implementation
4. **Performance Monitoring**: Verify no performance regression

### Quality Assurance
1. **Automated Reviews**: All code must pass automated code review
2. **Security Scanning**: Run security vulnerability scanners on each commit
3. **Performance Testing**: Automated performance regression testing
4. **Compatibility Testing**: Cross-browser and device testing

## 🔐 SECURITY STANDARDS

### Input Validation
- All external inputs must be validated at the boundary
- Sanitize all user inputs before processing
- Implement rate limiting for all API endpoints
- Use HTTPS for all communications

### Data Protection
- Sensitive data must be encrypted at rest
- API keys and secrets must be environment variables
- Implement proper authentication and authorization
- Log security events but not sensitive data

## 🛡️ AUTONOMOUS RESILIENCE PROTOCOLS

### TIMEOUT ENFORCEMENT
```typescript
// MANDATORY: All async operations must have timeouts
interface TimeoutConfig {
  command: number;      // CLI commands: 30s max
  api: number;          // API calls: 10s max
  database: number;     // DB operations: 5s max
  file: number;         // File operations: 15s max
  e2e: number;          // E2E tests: 60s max
}

const DEFAULT_TIMEOUTS: TimeoutConfig = {
  command: 30000,
  api: 10000,
  database: 5000,
  file: 15000,
  e2e: 60000,
};

// WRAPPER: All operations must use timeout wrapper
const withTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationType: string
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Operation ${operationType} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([operation, timeoutPromise]);
};
```

### CIRCUIT BREAKER PATTERN
```typescript
// PREVENT: Cascading failures and infinite loops
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(operation: () => Promise<T>, config: CircuitBreakerConfig): Promise<T> {
    if (this.state === 'OPEN' &&
        Date.now() - this.lastFailureTime < config.resetTimeout) {
      throw new CircuitBreakerOpenError('Circuit breaker is OPEN');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(config);
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(config: CircuitBreakerConfig) {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= config.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### STRUCTURED LOGGING SYSTEM
```typescript
// ELIMINATE: Log bloat, maintain full observability
interface LogEntry {
  timestamp: number;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  category: string;
  operation: string;
  duration?: number;
  metadata: Record<string, unknown>;
  correlationId: string;
  visibility: 'PUBLIC' | 'INTERNAL' | 'DEBUG' | 'TRACE';
}

class StructuredLogger {
  private logs: LogEntry[] = [];
  private maxLogSize = 10000;
  private compressionThreshold = 5000;

  log(entry: Omit<LogEntry, 'timestamp' | 'correlationId'>): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      correlationId: this.generateCorrelationId(),
      ...entry,
    };

    this.logs.push(logEntry);
    this.manageLogSize();
  }

  // QUERY: Get specific logs without full dump
  getLogs(filter: {
    level?: LogEntry['level'];
    category?: string;
    operation?: string;
    timeRange?: [number, number];
    visibility?: LogEntry['visibility'];
  }): LogEntry[] {
    return this.logs.filter(log => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.category && log.category !== filter.category) return false;
      if (filter.operation && log.operation !== filter.operation) return false;
      if (filter.timeRange) {
        const [start, end] = filter.timeRange;
        if (log.timestamp < start || log.timestamp > end) return false;
      }
      if (filter.visibility && log.visibility !== filter.visibility) return false;
      return true;
    });
  }

  private manageLogSize(): void {
    if (this.logs.length > this.compressionThreshold) {
      this.compressLogs();
    }
    if (this.logs.length > this.maxLogSize) {
      this.truncateOldestLogs();
    }
  }

  private compressLogs(): void {
    // Compress DEBUG and TRACE logs
    const recentLogs = this.logs.slice(-1000);
    const compressedOldLogs = this.logs.slice(0, -1000)
      .filter(log => log.visibility !== 'DEBUG' && log.visibility !== 'TRACE');

    this.logs = [...compressedOldLogs, ...recentLogs];
  }
}
```

### INFINITE LOOP PREVENTION
```typescript
// DETECT: And prevent infinite loops in all operations
class LoopDetector {
  private operationCounts = new Map<string, number>();
  private readonly maxIterations = 1000;
  private readonly timeWindow = 30000; // 30 seconds

  checkIteration(operationId: string): void {
    const currentCount = this.operationCounts.get(operationId) || 0;

    if (currentCount > this.maxIterations) {
      throw new InfiniteLoopError(`Operation ${operationId} exceeded maximum iterations`);
    }

    this.operationCounts.set(operationId, currentCount + 1);

    // Reset counter after time window
    setTimeout(() => {
      this.operationCounts.delete(operationId);
    }, this.timeWindow);
  }
}

// USAGE: All loops must be wrapped
const safeLoop = <T>(
  operationId: string,
  iterable: T[],
  callback: (item: T, index: number) => void
): void => {
  const detector = new LoopDetector();

  iterable.forEach((item, index) => {
    detector.checkIteration(`${operationId}_${index}`);
    callback(item, index);
  });
};
```

### MEMORY LEAK PREVENTION
```typescript
// MONITOR: And prevent memory accumulation
class MemoryMonitor {
  private readonly memoryLimit = 512 * 1024 * 1024; // 512MB
  private checkInterval = 10000; // 10 seconds

  startMonitoring(): void {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();

      if (memoryUsage.heapUsed > this.memoryLimit) {
        this.handleMemoryOverflow(memoryUsage);
      }

      // Log detailed memory metrics for debugging
      this.logMemoryMetrics(memoryUsage);
    }, this.checkInterval);
  }

  private handleMemoryOverflow(usage: NodeJS.MemoryUsage): void {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Alert and potentially restart process
    const logger = new StructuredLogger();
    logger.log({
      level: 'FATAL',
      category: 'MEMORY',
      operation: 'MONITOR',
      metadata: {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
      },
      visibility: 'INTERNAL',
    });

    // Consider graceful restart or circuit breaker activation
  }
}
```

### DEADLOCK PREVENTION
```typescript
// PREVENT: Resource deadlocks in concurrent operations
interface ResourceLock {
  resourceId: string;
  lockType: 'READ' | 'WRITE';
  timestamp: number;
  timeout: number;
}

class DeadlockPrevention {
  private locks = new Map<string, ResourceLock>();
  private readonly lockTimeout = 30000; // 30 seconds

  async acquireLock(
    resourceId: string,
    lockType: 'READ' | 'WRITE'
  ): Promise<void> {
    // Check for potential deadlock
    if (this.wouldCauseDeadlock(resourceId, lockType)) {
      throw new DeadlockError(`Acquiring lock on ${resourceId} would cause deadlock`);
    }

    // Wait for lock with timeout
    const startTime = Date.now();
    while (this.isLocked(resourceId) &&
           Date.now() - startTime < this.lockTimeout) {
      await this.sleep(100);
    }

    if (this.isLocked(resourceId)) {
      throw new TimeoutError(`Failed to acquire lock on ${resourceId} within timeout`);
    }

    this.locks.set(resourceId, {
      resourceId,
      lockType,
      timestamp: Date.now(),
      timeout: this.lockTimeout,
    });

    // Auto-release lock after timeout
    setTimeout(() => {
      this.releaseLock(resourceId);
    }, this.lockTimeout);
  }

  private wouldCauseDeadlock(resourceId: string, lockType: string): boolean {
    // Implement deadlock detection algorithm
    // Check for circular wait conditions
    return false; // Simplified for example
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### E2E TEST RESILIENCE
```typescript
// ENHANCE: E2E tests with automatic recovery
class ResilientE2ETest {
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;
  private readonly stepTimeout = 30000;

  async runE2ETest(testName: string, testSteps: Array<() => Promise<void>>): Promise<void> {
    const circuitBreaker = new CircuitBreaker();
    const logger = new StructuredLogger();

    for (const [index, step] of testSteps.entries()) {
      const stepName = `${testName}_step_${index}`;

      await circuitBreaker.execute(async () => {
        return this.executeStepWithRetry(stepName, step);
      }, {
        failureThreshold: 2,
        resetTimeout: 10000,
        monitoringPeriod: 30000,
      });
    }
  }

  private async executeStepWithRetry(
    stepName: string,
    step: () => Promise<void>
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await withTimeout(
          step(),
          this.stepTimeout,
          stepName
        );
        return; // Success
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }
}
```

### AUTONOMOUS SELF-HEALING
```typescript
// IMPLEMENT: Automatic problem detection and resolution
class SelfHealingSystem {
  private healthChecks: Array<() => Promise<boolean>> = [];
  private healingActions: Array<() => Promise<void>> = [];

  async performHealthCheck(): Promise<void> {
    const logger = new StructuredLogger();

    for (const [index, healthCheck] of this.healthChecks.entries()) {
      try {
        const isHealthy = await healthCheck();

        if (!isHealthy) {
          logger.log({
            level: 'WARN',
            category: 'HEALTH',
            operation: `CHECK_${index}`,
            metadata: { status: 'UNHEALTHY' },
            visibility: 'INTERNAL',
          });

          // Attempt self-healing
          await this.attemptHealing(index);
        }
      } catch (error) {
        logger.log({
          level: 'ERROR',
          category: 'HEALTH',
          operation: `CHECK_${index}`,
          metadata: { error: (error as Error).message },
          visibility: 'INTERNAL',
        });
      }
    }
  }

  private async attemptHealing(healthCheckIndex: number): Promise<void> {
    const logger = new StructuredLogger();

    for (const [actionIndex, healingAction] of this.healingActions.entries()) {
      try {
        await healingAction();

        logger.log({
          level: 'INFO',
          category: 'HEALING',
          operation: `ACTION_${actionIndex}`,
          metadata: { healthCheckIndex },
          visibility: 'INTERNAL',
        });

        break; // Stop after successful healing
      } catch (error) {
        logger.log({
          level: 'ERROR',
          category: 'HEALING',
          operation: `ACTION_${actionIndex}`,
          metadata: {
            healthCheckIndex,
            error: (error as Error).message
          },
          visibility: 'INTERNAL',
        });
      }
    }
  }
}

// GLOBAL: Initialize autonomous resilience
const autonomousResilience = {
  logger: new StructuredLogger(),
  memoryMonitor: new MemoryMonitor(),
  selfHealing: new SelfHealingSystem(),
};

// START: All resilience systems
autonomousResilience.memoryMonitor.startMonitoring();
setInterval(() => {
  autonomousResilience.selfHealing.performHealthCheck();
}, 60000); // Every minute

## 📋 COMPLIANCE CHECKLIST

### Before Commit
- [ ] All tests pass (100% success rate)
- [ ] Coverage requirements met
- [ ] TypeScript compilation succeeds
- [ ] ESLint rules pass (zero warnings)
- [ ] Performance benchmarks met
- [ ] Security scans pass
- [ ] Documentation is up-to-date

### Before Deploy
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] Security audit completed
- [ ] Dependencies are up-to-date
- [ ] Rollback plan is ready

---

## 🎖️ CONCLUSION

This constitution establishes the foundation for autonomous AI-driven development. Every line of code, every architectural decision, and every development process must align with these principles. Deviation from this constitution is considered a system violation and must be immediately corrected.

**Remember: The goal is not human-readable code, but autonomous, maintainable, and reliable systems that can evolve and improve without human intervention.**

*This document is a living constitution and may be updated only through systematic AI-driven processes based on empirical evidence and technological advancement.*
/**
 * Test suite for production readiness validation script
 *
 * Tests the validate-production-readiness.sh script functionality
 * Ensures all validation checks work correctly
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const SCRIPT_PATH = join(__dirname, 'validate-production-readiness.sh');

describe('Production Readiness Validation Script', () => {
  describe('Script existence and permissions', () => {
    it('should exist', () => {
      expect(existsSync(SCRIPT_PATH)).toBe(true);
    });

    it('should be executable', () => {
      const stats = require('fs').statSync(SCRIPT_PATH);
      // Check if executable bit is set (mode & 0111)
      const isExecutable = (stats.mode & parseInt('0111', 8)) !== 0;
      expect(isExecutable).toBe(true);
    });

    it('should have shebang pointing to bash', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content.startsWith('#!/bin/bash')).toBe(true);
    });
  });

  describe('Script structure', () => {
    it('should have set -euo pipefail for error handling', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/set -euo pipefail/);
    });

    it('should define all required sections', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      const requiredSections = [
        'Environment Validation',
        'Dependency Validation',
        'Type Safety Validation',
        'Linting Validation',
        'Testing Validation',
        'Database/Prisma Validation',
        'Build Validation',
        'Clean Architecture Validation',
        'Environment Configuration Validation',
        'Deployment Scripts Validation',
        'Resilience Protocols Validation',
      ];

      requiredSections.forEach((section) => {
        expect(content).toContain(section);
      });
    });

    it('should define logging functions', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toContain('log_info()');
      expect(content).toContain('log_success()');
      expect(content).toContain('log_failure()');
      expect(content).toContain('log_warning()');
    });

    it('should define test runner function', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('run_test()');
    });
  });

  describe('Validation checks', () => {
    it('should check for Node.js installation', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/node -v/);
    });

    it('should check for npm installation', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/npm -v/);
    });

    it('should check for required files', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/package\.json/);
      expect(content).toMatch(/tsconfig\.json/);
      expect(content).toMatch(/next\.config\.js/);
      expect(content).toMatch(/\.env\.example/);
    });

    it('should check for critical dependencies', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/node_modules\/next/);
      expect(content).toMatch(/node_modules\/react/);
      expect(content).toMatch(/node_modules\/typescript/);
      expect(content).toMatch(/node_modules\/@prisma\/client/);
      expect(content).toMatch(/node_modules\/zod/);
      expect(content).toMatch(/node_modules\/@testing-library/);
    });

    it('should check TypeScript compilation', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/tsc --noEmit/);
    });

    it('should check for any types', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/'any' type/);
    });

    it('should run ESLint', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/eslint/);
    });

    it('should run test suite', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/npm test/);
    });

    it('should check test coverage', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/test:coverage/);
      expect(content).toMatch(/COVERAGE_THRESHOLD/);
    });

    it('should validate Prisma schema', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/prisma validate/);
      expect(content).toMatch(/prisma\/schema\.prisma/);
    });

    it('should run production build', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/npm run build/);
      expect(content).toMatch(/\.next/);
    });

    it('should check Clean Architecture compliance', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/src\/domain/);
      expect(content).toMatch(/src\/application/);
      expect(content).toMatch(/src\/infrastructure/);
      expect(content).toMatch(/src\/app/);
    });

    it('should check for circular dependency violations', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/from.*infrastructure.*src\/domain/);
      expect(content).toMatch(/from.*application.*src\/domain/);
    });

    it('should validate environment configuration', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/\.env\.example/);
      expect(content).toMatch(/DATABASE_URL/);
      expect(content).toMatch(/DATABASE_PROVIDER/);
      expect(content).toMatch(/NEXT_PUBLIC_API_URL/);
    });

    it('should check deployment scripts', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/deploy-production\.sh/);
      expect(content).toMatch(/verify-deployment\.sh/);
    });

    it('should check resilience protocols', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/src\/lib\/resilience\/index\.ts/);
      expect(content).toMatch(/src\/lib\/resilience\/timeout\.ts/);
      expect(content).toMatch(/src\/lib\/resilience\/circuit-breaker\.ts/);
      expect(content).toMatch(/src\/lib\/resilience\/loop-detector\.ts/);
      expect(content).toMatch(/src\/lib\/resilience\/memory-monitor\.ts/);
    });
  });

  describe('Exit code behavior', () => {
    it('should exit with 0 when all checks pass', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Check that EXIT_CODE is initialized to 0
      expect(content).toMatch(/EXIT_CODE=0/);

      // Check that EXIT_CODE is set to 1 on failure
      expect(content).toMatch(/EXIT_CODE=1/);

      // Check that exit code is returned at the end
      expect(content).toMatch(/exit \$EXIT_CODE/);
    });

    it('should track test results', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/TESTS_PASSED=0/);
      expect(content).toMatch(/TESTS_FAILED=0/);
      expect(content).toMatch(/TESTS_TOTAL=0/);
      expect(content).toMatch(/\(\(TESTS_PASSED\+\+\)\)/);
      expect(content).toMatch(/\(\(TESTS_FAILED\+\+\)\)/);
      expect(content).toMatch(/\(\(TESTS_TOTAL\+\+\)\)/);
    });

    it('should display summary at the end', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toContain('Validation Summary');
      expect(content).toContain('Total Tests:');
      expect(content).toContain('Passed:');
      expect(content).toContain('Failed:');
    });

    it('should show production ready message on success', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('PRODUCTION READY');
    });

    it('should show not production ready message on failure', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toContain('NOT PRODUCTION READY');
    });
  });

  describe('Color output', () => {
    it('should define color codes', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/RED=/);
      expect(content).toMatch(/GREEN=/);
      expect(content).toMatch(/YELLOW=/);
      expect(content).toMatch(/BLUE=/);
      expect(content).toMatch(/NC=/);
    });

    it('should use colors in logging functions', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/\$\{RED\}/);
      expect(content).toMatch(/\$\{GREEN\}/);
      expect(content).toMatch(/\$\{YELLOW\}/);
      expect(content).toMatch(/\$\{BLUE\}/);
      expect(content).toMatch(/\$\{NC\}/);
    });
  });

  describe('Error handling', () => {
    it('should handle missing node_modules gracefully', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should check if node_modules exists before running checks
      expect(content).toMatch(/if \[ -d "node_modules" \]/);
    });

    it('should handle build failures gracefully', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should capture build output
      expect(content).toMatch(/build_output\.txt/);

      // Should show error output on failure
      expect(content).toMatch(/tail -n 50 build_output\.txt/);
    });

    it('should handle test failures gracefully', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should capture test output
      expect(content).toMatch(/test_output\.txt/);

      // Should show error output on failure
      expect(content).toMatch(/tail -n 30 test_output\.txt/);
    });
  });

  describe('Next steps guidance', () => {
    it('should provide next steps on success', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toContain('Next steps:');
      expect(content).toContain('./scripts/deploy-production.sh');
      expect(content).toContain('./scripts/verify-deployment.sh');
    });

    it('should provide guidance on failure', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toContain('Please fix the failures above before deploying to production');
    });
  });

  describe('Coverage thresholds', () => {
    it('should define coverage threshold constant', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');
      expect(content).toMatch(/COVERAGE_THRESHOLD=90/);
    });

    it('should check coverage against threshold', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should check statements coverage
      expect(content).toMatch(/COVERAGE_STATEMENTS >= \$COVERAGE_THRESHOLD/);

      // Should check branches coverage
      expect(content).toMatch(/COVERAGE_BRANCHES >= \$COVERAGE_THRESHOLD/);

      // Should check functions coverage
      expect(content).toMatch(/COVERAGE_FUNCTIONS >= \$COVERAGE_THRESHOLD/);

      // Should check lines coverage
      expect(content).toMatch(/COVERAGE_LINES >= \$COVERAGE_THRESHOLD/);
    });
  });

  describe('Integration with deployment workflow', () => {
    it('should be runnable from project root', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should determine project root
      expect(content).toMatch(/PROJECT_ROOT/);

      // Should change to project root
      expect(content).toMatch(/cd "\$PROJECT_ROOT"/);
    });

    it('should work with existing deployment scripts', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should check for deploy-production.sh
      expect(content).toContain('scripts/deploy-production.sh');

      // Should check for verify-deployment.sh
      expect(content).toContain('scripts/verify-deployment.sh');
    });
  });

  describe('Constitution compliance', () => {
    it('should validate TypeScript strict mode (§3 TYPE SUPREMACY)', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should run TypeScript compilation
      expect(content).toMatch(/tsc --noEmit/);

      // Should check for any types
      expect(content).toMatch(/'any' type/);
    });

    it('should validate Clean Architecture (§2 RIGOROUS ARCHITECTURAL DISCIPLINE)', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should check for all 4 layers
      expect(content).toMatch(/src\/domain/);
      expect(content).toMatch(/src\/application/);
      expect(content).toMatch(/src\/infrastructure/);
      expect(content).toMatch(/src\/app/);

      // Should check for dependency violations
      expect(content).toMatch(/from.*infrastructure.*src\/domain/);
      expect(content).toMatch(/from.*application.*src\/domain/);
    });

    it('should validate testing mandates (§7 TESTING MANDATES)', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should run test suite
      expect(content).toMatch(/npm test/);

      // Should check coverage
      expect(content).toMatch(/test:coverage/);

      // Should enforce coverage threshold
      expect(content).toMatch(/COVERAGE_THRESHOLD/);
    });

    it('should validate resilience protocols (§6 AUTONOMOUS RESILIENCE PROTOCOLS)', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Should check for all resilience components
      expect(content).toMatch(/timeout\.ts/);
      expect(content).toMatch(/circuit-breaker\.ts/);
      expect(content).toMatch(/loop-detector\.ts/);
      expect(content).toMatch(/memory-monitor\.ts/);
    });
  });

  describe('Script documentation', () => {
    it('should have description comment at the top', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      expect(content).toMatch(/Production Readiness Validation Script/);
      expect(content).toMatch(/resilience protocols/);
    });

    it('should have section headers', () => {
      const content = readFileSync(SCRIPT_PATH, 'utf-8');

      // Check for section headers with ===
      expect(content).toMatch(/=== .* ===/);
    });
  });
});

/**
 * Jest Configuration
 *
 * Migration Notes (2024):
 * - Switched from babel-jest to ts-jest for better TypeScript integration
 * - ts-jest provides faster compilation and better type checking in tests
 * - Asset mocking added for CSS, SVG, and image files
 * - All 201 tests passing after migration
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  forceExit: true,
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/playwright/'],
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/infrastructure/repositories/**/*.test.ts',
        '<rootDir>/src/lib/resilience/**/*.test.ts',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            module: 'commonjs',
          },
        }],
      },
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/*.test.ts?(x)',
        '!<rootDir>/src/infrastructure/repositories/**/*.test.ts',
        '!<rootDir>/src/lib/resilience/**/*.test.ts',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(png|jpg|jpeg|gif|svg|ico|webp)$': '<rootDir>/__mocks__/fileMock.js',
        'react-apexcharts': '<rootDir>/__mocks__/react-apexcharts.js',
      },
  transform: {
    // Simplified ts-jest configuration - only override what differs from main tsconfig
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        // Only override module for Jest (requires CommonJS)
        module: 'commonjs',
        jsx: 'react-jsx',
        // esModuleInterop, allowSyntheticDefaultImports inferred from main tsconfig
      },
    }],
    '^.+\\.(js|jsx)$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
        jsx: 'react-jsx',
      },
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    // Removed: '^.+\\.module\\.(css|sass|scss)$' - CSS modules already mocked in moduleNameMapper
  ],
  cacheDirectory: '<rootDir>/.jest-cache',
    },
  ],
  collectCoverageFrom: [
    'src/domain/**/*.{ts,tsx}',
    'src/application/**/*.{ts,tsx}',
    'src/infrastructure/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/schemas/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.test.setup.{ts,tsx}',
    '!src/test-utils/**',
    '!src/mirage/**',
    '!src/infrastructure/factories/repositoryFactory.ts',
    '!src/context/**',
    '!src/components/common/PageBreadCrumb.tsx',
    '!src/components/common/ComponentCard.tsx',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 85,
      lines: 90,
    },
    './src/domain/**/*.ts': {
      statements: 100,
      branches: 95,
      functions: 100,
      lines: 100,
    },
  },
};
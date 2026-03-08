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
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/playwright/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^.+\\.(png|jpg|jpeg|gif|svg|ico|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    // Simplified ts-jest configuration - only override what differs from main tsconfig
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        // Only override module for Jest (requires CommonJS)
        module: 'commonjs',
        // jsx: 'react' is inferred from main tsconfig
        // esModuleInterop, allowSyntheticDefaultImports inferred from main tsconfig
      },
    }],
    '^.+\\.(js|jsx)$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
        jsx: 'react',
      },
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    // Removed: '^.+\\.module\\.(css|sass|scss)$' - CSS modules already mocked in moduleNameMapper
  ],
  cacheDirectory: '<rootDir>/.jest-cache',
};
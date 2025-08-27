module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/claude'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'claude/**/*.ts',
    '!claude/**/*.test.ts',
    '!claude/**/*.stories.ts'
  ],
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/__mocks__/obsidian.ts'
  }
};
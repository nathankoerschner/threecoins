/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  // Path alias mapping (mirrors tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform settings for TypeScript and React Native
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/hooks/**/*.ts',
    'src/data/**/*.ts',
    '!**/*.d.ts',
  ],

  // TypeScript
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Test environment - node for utility tests
  testEnvironment: 'node',

  // Clear mocks between tests
  clearMocks: true,
};

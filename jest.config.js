export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1.js',
  },
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).js'
  ],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};

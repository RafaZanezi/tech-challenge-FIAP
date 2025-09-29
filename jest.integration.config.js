
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/src/modules/**/*.integration.test.ts',
    '**/src/api/**/*.integration.test.ts'
  ],
  setupFilesAfterEnv: ['./jest.config.js'],
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true
};
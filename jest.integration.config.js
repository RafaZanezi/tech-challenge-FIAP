
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/modules/**/*.integration.test.ts'],
  setupFilesAfterEnv: ['./jest.config.js']
};
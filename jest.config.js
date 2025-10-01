module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.integration.test.ts',
    '!src/**/test/**',
    '!src/**/tests/**'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Configurações para testes de integração
  maxWorkers: 1, // Força execução sequencial para testes de integração
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true
};
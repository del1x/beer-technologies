/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  
  globals: {
    'ts-jest': {
      isolatedModules: true,  
      tsconfig: '<rootDir>/tsconfig.jest.json'  
    }
  },
  
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/src/js/modules/$1',
    '^@core/(.*)$': '<rootDir>/src/js/core/$1',
    '^@css/(.*)$': '<rootDir>/src/css/$1',
    '^@images/(.*)$': '<rootDir>/public/images/$1'  
  },
  
  testMatch: ['**/*.test.ts'],
  roots: ['<rootDir>/tests'],
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  resetMocks: true,
  clearMocks: true,
  

  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json']
};
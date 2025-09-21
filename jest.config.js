module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
  '^@/components/(.*)$': '<rootDir>/components/$1',
  '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
  '^@/lib/(.*)$': '<rootDir>/lib/$1',
  // Adicione outros conforme necessário
},
};
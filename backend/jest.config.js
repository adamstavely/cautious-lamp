module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: { allowJs: true } }],
  },
  // jsdom 27 depends on parse5 8 and entities 6, which ship ESM only, so Jest
  // has to transform them like source files.
  transformIgnorePatterns: ['/node_modules/(?!(jsdom/node_modules/|parse5/node_modules/)?(parse5|entities)/)'],
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

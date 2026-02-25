export default {
  testEnvironment: "jsdom",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1.js"
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  coverageReporters: ["text", "text-summary"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 65,
      functions: 80,
      lines: 80
    }
  }
};
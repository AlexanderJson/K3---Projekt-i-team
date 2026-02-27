export default {
  testEnvironment: "jsdom",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/docs/"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/docs/"],
  setupFilesAfterEnv: ["./jest.setup.js"],
  coverageReporters: ["text", "text-summary"],
  
  // Vi ignorerar filer som inte är logik-tunga för att få en rättvisande bild
  collectCoverageFrom: [
    "js/**/*.js",
    "!js/taskList/seed.js",
    "!js/comps/welcomeOverlay.js",
    "!js/data/tasks.js",
    "!js/**/*.test.js",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/docs/**",
    "!js/card/**",
    "!js/menu/**",
    "!js/people/peopleModal.js",
    "!js/repo/taskRepo.js"
  ],

  // Återställda krav för hög täckning
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 65,
      functions: 80,
      lines: 80
    }
  }
};
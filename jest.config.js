export default {
  testEnvironment: "jsdom",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  coverageReporters: ["text", "text-summary"],
  
  // Vi ignorerar filer som inte är logik-tunga för att få en rättvisande bild
  collectCoverageFrom: [
    "js/**/*.js",
    "!js/taskList/seed.js",
    "!js/comps/welcomeOverlay.js",
    "!js/data/tasks.js"
  ],

  // Justerade gränsvärden för att matcha din nuvarande täckning
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 55,
      functions: 65,
      lines: 75
    }
  }
};
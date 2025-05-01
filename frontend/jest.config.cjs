/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    // Handle CSS imports
    "^.+\\.css$": "identity-obj-proxy",

    // Handle image imports
    "^.+\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",

    // Handle module path aliases if you configured them in vite.config.ts
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    // Use babel-jest to transpile tests with the babel presets from vite
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  // Ensure test files are matched correctly
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  // Support ESM configuration in test files
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  // Exclude node_modules from transformation
  transformIgnorePatterns: ["/node_modules/(?!.*\\.mjs$)"],
  collectCoverage: true,
  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/services/**/*.ts",
    "!src/components/ui/**/*.tsx",
    "!src/main.tsx",
    "!src/App.tsx",
    "!src/vite-env.d.ts",
  ],
};

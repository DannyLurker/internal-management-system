import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.integration.setup.ts"],
  testMatch: ["<rootDir>/integration-tests/**/*.test.ts"],
  transform: {
    // This explicitly tells Jest how to read "import" statements in .ts files
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default config;

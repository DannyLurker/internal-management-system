import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e-tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: "chromium CRUD location tests (Manager)",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/manager.json",
      },
      dependencies: ["setup"],
      testMatch: "**/location.spec.ts",
    },

    // {
    //   name: "chromium CRUD category tests (Manager)",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     storageState: "playwright/.auth/manager.json",
    //   },
    //   dependencies: ["setup"],
    //   testMatch: "**/category.spec.ts",
    // },

    // {
    //   name: "chromium CRUD item tests (Manager)",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     storageState: "playwright/.auth/manager.json",
    //   },
    //   dependencies: ["setup"],
    //   testMatch: "**/item.spec.ts",
    // },

    // {
    //   name: "chromium CRUD stock tests (Manager)",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     storageState: "playwright/.auth/manager.json",
    //   },
    //   dependencies: ["setup"],
    //   testMatch: "**/stock.spec.ts",
    // },

    // {
    //   name: "chromium CRUD stock movement tests (Manager)",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     storageState: "playwright/.auth/manager.json",
    //   },
    //   dependencies: ["setup"],
    //   testMatch: "**/stock-movement.spec.ts",
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

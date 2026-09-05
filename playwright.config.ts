import { defineConfig } from "@playwright/test";

/**
 * End-to-end journeys against the dev server. The tests create their own local
 * profiles in IndexedDB, so no credentials and no network are needed.
 *
 *   bash tools/dev.sh && npx playwright test
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.STUDY_BASE_URL ?? "http://localhost:3000",
    viewport: { width: 1280, height: 860 },
    launchOptions: { executablePath: process.env.STUDY_CHROMIUM ?? "/opt/pw-browsers/chromium" },
    trace: "retain-on-failure",
  },
  webServer: process.env.STUDY_BASE_URL
    ? undefined
    : {
        command: "npx next dev -p 3000",
        url: "http://localhost:3000/api/ai/status",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});

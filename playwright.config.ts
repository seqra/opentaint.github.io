import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/a11y",
  timeout: 30_000,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

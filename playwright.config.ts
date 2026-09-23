import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  workers: 1,
  retries: 0,
});

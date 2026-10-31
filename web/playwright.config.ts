import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3101",
    ...devices["iPhone 15"],
    defaultBrowserType: "chromium",
    timezoneId: "America/Sao_Paulo",
    locale: "pt-BR",
  },
  webServer: {
    command: "npm run dev -- -p 3101",
    url: "http://localhost:3101/hoje",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

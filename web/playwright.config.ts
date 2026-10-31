import { defineConfig, devices } from "@playwright/test";

const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: external ?? "http://localhost:3101",
    ...devices["iPhone 15"],
    defaultBrowserType: "chromium",
    timezoneId: "America/Sao_Paulo",
    locale: "pt-BR",
  },
  webServer: external ? undefined : {
    command: "npm run dev -- -p 3101",
    url: "http://localhost:3101/hoje",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

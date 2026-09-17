/**
 * Playwright configuration.
 *
 * NOTE: The primary test runner is Cucumber (see cucumber.js). This config
 * is used for:
 *   1. `npx playwright install [browser]` — installing browser binaries.
 *   2. The optional native Playwright suite in ./tests (npm run test:playwright).
 *   3. The Playwright Trace Viewer / tooling that reads playwright.config.ts.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3100',
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15_000,
    screenshot: process.env.SCREENSHOT === 'on' ? 'on' : 'only-on-failure',
    video: process.env.VIDEO === 'on' ? 'on' : 'off',
    trace: process.env.TRACE === 'on' ? 'on' : process.env.CI ? 'retain-on-failure' : 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});

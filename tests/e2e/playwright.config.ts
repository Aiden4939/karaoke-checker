import { defineConfig, devices } from '@playwright/test'

const webPort = Number(process.env.WEB_PORT) || 5173
const apiPort = Number(process.env.API_PORT) || 3000
const webBaseUrl = process.env.E2E_WEB_URL ?? `http://localhost:${webPort}`
const apiBaseUrl = process.env.E2E_API_URL ?? `http://localhost:${apiPort}`
const webServer =
  process.env.E2E_SKIP_WEBSERVER === '1'
    ? undefined
    : [
        {
          command: `pnpm --filter @app/api dev`,
          url: `${apiBaseUrl}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: String(apiPort),
            CORS_ORIGIN: webBaseUrl,
            LOG_LEVEL: 'error',
          },
        },
        {
          command: `pnpm --filter @app/web dev`,
          url: webBaseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            WEB_PORT: String(webPort),
            VITE_API_BASE_URL: apiBaseUrl,
            DISABLE_VUE_DEVTOOLS: '1',
          },
        },
      ]

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: webBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: 'test-results',
  webServer,
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],
})

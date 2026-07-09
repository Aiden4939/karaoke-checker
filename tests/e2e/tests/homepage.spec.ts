import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const consoleErrors: string[] = []
const failedRequests: string[] = []

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0
  failedRequests.length = 0

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  page.on('requestfailed', (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()} - ${request.failure()?.errorText ?? 'failed'}`,
    )
  })

  page.on('response', (response) => {
    const url = response.url()
    const isAppAsset = url.includes('localhost') || url.startsWith('/')
    const isHealth = url.includes('/health')

    if (isAppAsset && isHealth && response.status() >= 400) {
      failedRequests.push(`${response.request().method()} ${url} - HTTP ${response.status()}`)
    }
  })
})

test('homepage loads and shows welcome content', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
})

test('frontend receives backend health status', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('health-success')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('Service is healthy')).toBeVisible()
  await expect(page.getByText('Service: api')).toBeVisible()
})

test('page has no unhandled console errors', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('health-success')).toBeVisible({ timeout: 15_000 })

  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('required network requests do not fail', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('health-success')).toBeVisible({ timeout: 15_000 })

  expect(failedRequests, `Failed requests: ${failedRequests.join('\n')}`).toEqual([])
})

test('homepage passes basic accessibility checks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('health-success')).toBeVisible({ timeout: 15_000 })

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

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
    const isApi = url.includes('/playlist-checks')

    if (isAppAsset && isApi && response.status() >= 400) {
      failedRequests.push(`${response.request().method()} ${url} - HTTP ${response.status()}`)
    }
  })
})

test('homepage loads and shows checker content', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Karaoke Checker' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Checker', exact: true })).toBeVisible()
  await expect(page.getByLabel('YouTube playlist URL')).toBeVisible()
})

test('page has no unhandled console errors', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Karaoke Checker' })).toBeVisible()

  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('required network requests do not fail', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Karaoke Checker' })).toBeVisible()

  expect(failedRequests, `Failed requests: ${failedRequests.join('\n')}`).toEqual([])
})

test('homepage passes basic accessibility checks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Karaoke Checker' })).toBeVisible()

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

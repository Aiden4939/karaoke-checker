import { describe, expect, it } from 'vitest'
import { apiErrorResponseSchema, healthResponseSchema } from '@app/contracts'
import { createApp } from './app.js'
import type { Env } from './env.js'

const testEnv: Env = {
  NODE_ENV: 'test',
  PORT: 3000,
  CORS_ORIGIN: 'http://localhost:5173',
  LOG_LEVEL: 'error',
  PLAYLIST_CHECK_STORE_PATH: '/tmp/karaoke-checker-app-test.json',
}

const app = createApp(testEnv)

describe('GET /health', () => {
  it('returns the health payload', async () => {
    const response = await app.request('/health')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(healthResponseSchema.parse(body)).toEqual({
      data: {
        status: 'ok',
        service: 'api',
      },
      meta: {
        requestId: expect.any(String),
      },
    })
  })
})

describe('request id middleware', () => {
  it('generates a request id when one is not provided', async () => {
    const response = await app.request('/health')
    const body = await response.json()

    expect(response.headers.get('x-request-id')).toBe(body.meta.requestId)
  })

  it('reuses the incoming request id header', async () => {
    const requestId = 'test-request-id-123'

    const response = await app.request('/health', {
      headers: {
        'x-request-id': requestId,
      },
    })
    const body = await response.json()

    expect(response.headers.get('x-request-id')).toBe(requestId)
    expect(body.meta.requestId).toBe(requestId)
  })
})

describe('404 handler', () => {
  it('returns a structured not found error', async () => {
    const response = await app.request('/missing-route')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(apiErrorResponseSchema.parse(body)).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
        details: [],
        requestId: expect.any(String),
      },
    })
  })
})

describe('validation errors', () => {
  it('returns a structured validation error for invalid query params', async () => {
    const response = await app.request('/echo')
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(apiErrorResponseSchema.parse(body)).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        requestId: expect.any(String),
      },
    })
    expect(body.error.details.length).toBeGreaterThan(0)
  })

  it('returns a structured validation error for non-playlist URLs', async () => {
    const response = await app.request('/playlist-checks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        playlistUrl: 'https://www.youtube.com/watch?v=abc',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(apiErrorResponseSchema.parse(body)).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        requestId: expect.any(String),
      },
    })
  })
})

describe('error handler', () => {
  it('does not expose stack traces in production', async () => {
    const { createErrorHandler } = await import('./middleware/error-handler.js')
    const { requestId } = await import('./middleware/request-id.js')
    const { Hono } = await import('hono')

    const productionApp = new Hono()
    productionApp.use('*', requestId)
    productionApp.get('/boom', () => {
      throw new Error('Intentional test error')
    })
    productionApp.onError(createErrorHandler('production'))

    const response = await productionApp.request('/boom')
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error.stack).toBeUndefined()
    expect(body.error.message).toBe('Internal server error')
  })

  it('includes stack traces outside production', async () => {
    const response = await app.request('/__test/error')
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error.stack).toEqual(expect.any(String))
  })
})

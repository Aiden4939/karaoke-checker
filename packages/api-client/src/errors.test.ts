import { describe, expect, it } from 'vitest'
import { ApiClientError, parseApiErrorResponse } from './errors.js'
import { resolveApiBaseUrl } from './client.js'

describe('resolveApiBaseUrl', () => {
  it('strips trailing slashes', () => {
    expect(resolveApiBaseUrl('http://localhost:3000/')).toBe('http://localhost:3000')
  })
})

describe('parseApiErrorResponse', () => {
  it('parses structured API errors', () => {
    const error = parseApiErrorResponse(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found',
          details: [],
          requestId: 'req-1',
        },
      },
      404,
    )

    expect(error).toBeInstanceOf(ApiClientError)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.requestId).toBe('req-1')
    expect(error.status).toBe(404)
  })
})

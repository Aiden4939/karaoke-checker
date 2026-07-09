import { describe, expect, it } from 'vitest'
import { healthResponseSchema } from './health.js'

describe('healthResponseSchema', () => {
  it('accepts a valid health response', () => {
    expect(
      healthResponseSchema.parse({
        data: {
          status: 'ok',
          service: 'api',
        },
        meta: {
          requestId: 'req-1',
        },
      }),
    ).toEqual({
      data: {
        status: 'ok',
        service: 'api',
      },
      meta: {
        requestId: 'req-1',
      },
    })
  })
})

import { http, HttpResponse, delay } from 'msw'

const apiBaseUrl = 'http://localhost:3000'

const healthyPayload = {
  data: {
    status: 'ok' as const,
    service: 'api' as const,
  },
  meta: {
    requestId: 'req-test-1',
  },
}

export const healthHandlers = [
  http.get(`${apiBaseUrl}/health`, () => {
    return HttpResponse.json(healthyPayload)
  }),
]

export const healthLoadingHandlers = [
  http.get(`${apiBaseUrl}/health`, async () => {
    await delay('infinite')
    return HttpResponse.json(healthyPayload)
  }),
]

export const healthErrorHandlers = [
  http.get(`${apiBaseUrl}/health`, () => {
    return HttpResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Health check failed',
          details: [],
          requestId: 'req-error-1',
        },
      },
      { status: 500 },
    )
  }),
]

export const handlers = [...healthHandlers]

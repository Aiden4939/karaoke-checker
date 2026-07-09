import { hc } from 'hono/client'
import type { AppType } from '@app/api'
import { healthResponseSchema } from '@app/contracts'
import { ApiClientError, NetworkError, ValidationError, parseApiErrorResponse } from './errors.js'

export type ApiClient = ReturnType<typeof createApiClient>

export function resolveApiBaseUrl(baseUrl = 'http://localhost:3000'): string {
  return baseUrl.replace(/\/$/, '')
}

export function createApiClient(baseUrl?: string) {
  return hc<AppType>(resolveApiBaseUrl(baseUrl))
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text.length > 0 ? text : null
}

export async function unwrapResponse<T>(
  response: Response,
  schema: { parse: (value: unknown) => T },
): Promise<T> {
  let body: unknown

  try {
    body = await readResponseBody(response)
  } catch (cause) {
    throw new NetworkError('Failed to read API response', cause)
  }

  if (!response.ok) {
    throw parseApiErrorResponse(body, response.status)
  }

  try {
    return schema.parse(body)
  } catch (cause) {
    throw new ValidationError('API response failed validation', cause)
  }
}

export async function getHealth(client: ApiClient) {
  let response: Response

  try {
    const healthRoute = client.health
    if (!healthRoute) {
      throw new ApiClientError('Health route is unavailable', {
        code: 'ROUTE_NOT_FOUND',
        requestId: 'unknown',
        status: 500,
      })
    }

    response = await healthRoute.$get()
  } catch (cause) {
    if (cause instanceof ApiClientError) {
      throw cause
    }

    throw new NetworkError('API request failed', cause)
  }

  if (!response.ok) {
    const body = await readResponseBody(response)
    throw parseApiErrorResponse(body, response.status)
  }

  return unwrapResponse(response, healthResponseSchema)
}

export { ApiClientError, NetworkError, ValidationError, parseApiErrorResponse }

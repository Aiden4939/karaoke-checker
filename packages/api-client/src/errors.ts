import { apiErrorResponseSchema, type ApiErrorResponse } from '@app/contracts'

export class ApiClientError extends Error {
  readonly code: string
  readonly details: unknown[]
  readonly requestId: string
  readonly status: number

  constructor(
    message: string,
    options: {
      code: string
      details?: unknown[]
      requestId: string
      status: number
    },
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.code = options.code
    this.details = options.details ?? []
    this.requestId = options.requestId
    this.status = options.status
  }
}

export class NetworkError extends Error {
  readonly cause: unknown

  constructor(message: string, cause: unknown) {
    super(message)
    this.name = 'NetworkError'
    this.cause = cause
  }
}

export class ValidationError extends Error {
  readonly issues: unknown

  constructor(message: string, issues: unknown) {
    super(message)
    this.name = 'ValidationError'
    this.issues = issues
  }
}

export function parseApiErrorResponse(body: unknown, status: number): ApiClientError {
  const parsed = apiErrorResponseSchema.safeParse(body)

  if (parsed.success) {
    const { error } = parsed.data
    return new ApiClientError(error.message, {
      code: error.code,
      details: error.details,
      requestId: error.requestId,
      status,
    })
  }

  return new ApiClientError('Unexpected API error response', {
    code: 'INTERNAL_SERVER_ERROR',
    details: [body],
    requestId: 'unknown',
    status,
  })
}

export type { ApiErrorResponse }

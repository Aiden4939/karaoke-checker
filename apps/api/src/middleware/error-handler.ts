import type { ApiErrorCode } from '@app/contracts'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HTTPException } from 'hono/http-exception'
import type { ZodError } from 'zod'
import type { Env } from '../env.js'
import { getRequestId } from './request-id.js'

type ErrorBody = {
  error: {
    code: ApiErrorCode
    message: string
    details: unknown[]
    requestId: string
    stack?: string
  }
}

function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as ZodError).issues)
  )
}

export function buildErrorResponse(
  c: Context,
  options: {
    code: ApiErrorCode
    message: string
    details?: unknown[]
    status: ContentfulStatusCode
    stack?: string
  },
) {
  const body: ErrorBody = {
    error: {
      code: options.code,
      message: options.message,
      details: options.details ?? [],
      requestId: getRequestId(c),
    },
  }

  if (options.stack) {
    body.error.stack = options.stack
  }

  return c.json(body, options.status)
}

export function createErrorHandler(nodeEnv: Env['NODE_ENV']) {
  return (error: Error, c: Context) => {
    if (error instanceof HTTPException) {
      const status = error.status
      const code: ApiErrorCode =
        status === 404 ? 'NOT_FOUND' : status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'

      return buildErrorResponse(c, {
        code,
        message: error.message || 'Request failed',
        status: status as ContentfulStatusCode,
        stack: nodeEnv === 'production' ? undefined : error.stack,
      })
    }

    if (isZodError(error)) {
      return buildErrorResponse(c, {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.issues,
        status: 400,
        stack: nodeEnv === 'production' ? undefined : error.stack,
      })
    }

    return buildErrorResponse(c, {
      code: 'INTERNAL_SERVER_ERROR',
      message: nodeEnv === 'production' ? 'Internal server error' : error.message,
      status: 500,
      stack: nodeEnv === 'production' ? undefined : error.stack,
    })
  }
}

export function createNotFoundHandler() {
  return (c: Context) =>
    buildErrorResponse(c, {
      code: 'NOT_FOUND',
      message: 'Route not found',
      status: 404,
    })
}

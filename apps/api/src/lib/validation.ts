import type { ValidationTargets } from 'hono'
import { zValidator as baseZValidator } from '@hono/zod-validator'
import type { ZodSchema } from 'zod'
import { buildErrorResponse } from '../middleware/error-handler.js'

export function zValidator<T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) {
  return baseZValidator(target, schema, (result, c) => {
    if (!result.success) {
      return buildErrorResponse(c, {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: result.error.issues,
        status: 400,
      })
    }
  })
}

import { z } from 'zod'

export const apiErrorCodeSchema = z.enum([
  'BAD_REQUEST',
  'NOT_FOUND',
  'INTERNAL_SERVER_ERROR',
  'VALIDATION_ERROR',
])

export const apiErrorSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
  details: z.array(z.unknown()),
  requestId: z.string(),
})

export const apiErrorResponseSchema = z.object({
  error: apiErrorSchema,
})

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>
export type ApiError = z.infer<typeof apiErrorSchema>
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>

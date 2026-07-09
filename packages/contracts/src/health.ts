import { z } from 'zod'

export const healthDataSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('api'),
})

export const responseMetaSchema = z.object({
  requestId: z.string(),
})

export const healthResponseSchema = z.object({
  data: healthDataSchema,
  meta: responseMetaSchema,
})

export type HealthData = z.infer<typeof healthDataSchema>
export type ResponseMeta = z.infer<typeof responseMetaSchema>
export type HealthResponse = z.infer<typeof healthResponseSchema>

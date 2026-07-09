import { z } from 'zod'

export const echoQuerySchema = z.object({
  message: z.string().min(1),
})

export type EchoQuery = z.infer<typeof echoQuerySchema>

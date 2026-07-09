import { createMiddleware } from 'hono/factory'
import { randomUUID } from 'node:crypto'

export const REQUEST_ID_HEADER = 'x-request-id'

export const requestId = createMiddleware(async (c, next) => {
  const incoming = c.req.header(REQUEST_ID_HEADER)
  const id = incoming && incoming.length > 0 ? incoming : randomUUID()

  c.set('requestId', id)
  c.header(REQUEST_ID_HEADER, id)

  await next()
})

export function getRequestId(c: { get: (key: 'requestId') => string }): string {
  return c.get('requestId')
}

import { echoQuerySchema } from '@app/contracts'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import type { Env } from './env.js'
import { zValidator } from './lib/validation.js'
import { createErrorHandler, createNotFoundHandler } from './middleware/error-handler.js'
import { createLogger } from './middleware/logger.js'
import { getRequestId, requestId } from './middleware/request-id.js'

export type AppBindings = {
  Variables: {
    requestId: string
  }
}

export function createApp(env: Env) {
  const app = new Hono<AppBindings>()
    .use('*', requestId)
    .use('*', createLogger(env.LOG_LEVEL))
    .use(
      '*',
      cors({
        origin: env.CORS_ORIGIN,
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        exposeHeaders: ['x-request-id'],
      }),
    )
    .use('*', secureHeaders())
    .get('/health', (c) =>
      c.json({
        data: {
          status: 'ok',
          service: 'api',
        },
        meta: {
          requestId: getRequestId(c),
        },
      }),
    )
    .get('/echo', zValidator('query', echoQuerySchema), (c) => {
      const query = c.req.valid('query')

      return c.json({
        data: {
          message: query.message,
        },
        meta: {
          requestId: getRequestId(c),
        },
      })
    })

  if (env.NODE_ENV !== 'production') {
    app.get('/__test/error', () => {
      throw new Error('Intentional test error')
    })
  }

  app.notFound(createNotFoundHandler())
  app.onError(createErrorHandler(env.NODE_ENV))

  return app
}

const appForType = createApp({
  NODE_ENV: 'development',
  PORT: 3000,
  CORS_ORIGIN: 'http://localhost:5173',
  LOG_LEVEL: 'info',
})

export type AppType = typeof appForType

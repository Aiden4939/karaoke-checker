import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { env } from './env.js'
import { registerGracefulShutdown } from './lib/graceful-shutdown.js'

const app = createApp(env)

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

registerGracefulShutdown(['SIGINT', 'SIGTERM'], {
  server,
  exit: (code) => process.exit(code),
  onCloseError: (error) => {
    console.error('Failed to close server:', error)
  },
})

import { createMiddleware } from 'hono/factory'
import type { Env } from '../env.js'

type LogLevel = Env['LOG_LEVEL']

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export function createLogger(logLevel: LogLevel) {
  const threshold = levelPriority[logLevel]

  const write = (level: LogLevel, message: string) => {
    if (levelPriority[level] < threshold) {
      return
    }

    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
    }

    console.log(JSON.stringify(payload))
  }

  return createMiddleware(async (c, next) => {
    const start = Date.now()
    const method = c.req.method
    const path = c.req.path

    write('info', `request started ${method} ${path}`)

    await next()

    const durationMs = Date.now() - start
    write('info', `request completed ${method} ${path} ${c.res.status} ${durationMs}ms`)
  })
}

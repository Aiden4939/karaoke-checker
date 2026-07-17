import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().min(1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  YOUTUBE_API_KEY: z.string().trim().min(1).optional(),
  PLAYLIST_CHECK_STORE_PATH: z.string().trim().min(1).default('data/playlist-checks.json'),
})

export type Env = z.infer<typeof envSchema>

function parseDotEnv(content: string): NodeJS.ProcessEnv {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=')

        if (separatorIndex === -1) {
          return null
        }

        const key = line.slice(0, separatorIndex).trim()
        const rawValue = line.slice(separatorIndex + 1).trim()
        const value = rawValue.replace(/^(['"])(.*)\1$/, '$2')

        return [key, value] as const
      })
      .filter((entry): entry is readonly [string, string] => entry !== null),
  )
}

function loadDotEnvFile(): NodeJS.ProcessEnv {
  const path = fileURLToPath(new URL('../.env', import.meta.url))

  if (!existsSync(path)) {
    return {}
  }

  return parseDotEnv(readFileSync(path, 'utf8'))
}

function loadRuntimeEnv(): NodeJS.ProcessEnv {
  return {
    ...loadDotEnvFile(),
    ...process.env,
  }
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source)

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid environment variables: ${message}`)
  }

  return parsed.data
}

export const env = loadEnv(loadRuntimeEnv())

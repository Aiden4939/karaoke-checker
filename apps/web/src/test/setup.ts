import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { resetApiClient } from '@/lib/api'
import { server } from '@/mocks/server'

vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000')

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  resetApiClient()
})

afterAll(() => {
  server.close()
})

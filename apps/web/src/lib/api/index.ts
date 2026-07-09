import { createApiClient, getHealth, type ApiClient } from '@app/api-client'

let client: ApiClient | null = null

export function getApiClient(): ApiClient {
  if (!client) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
    client = createApiClient(baseUrl)
  }

  return client
}

export function resetApiClient(): void {
  client = null
}

export async function fetchHealth() {
  return getHealth(getApiClient())
}

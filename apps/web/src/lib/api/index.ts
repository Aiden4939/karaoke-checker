import {
  createApiClient,
  createPlaylistCheck,
  exportPlaylistCheckCsv,
  getHealth,
  getPlaylistCheck,
  listPlaylistChecks,
  recheckPlaylistCheckItem,
  updatePlaylistCheckItem,
  type ApiClient,
} from '@app/api-client'
import type { CreatePlaylistCheckRequest, UpdatePlaylistCheckItemRequest } from '@app/contracts'

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

export async function startPlaylistCheck(input: CreatePlaylistCheckRequest) {
  return createPlaylistCheck(getApiClient(), input)
}

export async function fetchPlaylistCheck(id: string) {
  return getPlaylistCheck(getApiClient(), id)
}

export async function fetchPlaylistChecks() {
  return listPlaylistChecks(getApiClient())
}

export async function savePlaylistCheckItem(
  checkId: string,
  itemId: string,
  input: UpdatePlaylistCheckItemRequest,
) {
  return updatePlaylistCheckItem(getApiClient(), checkId, itemId, input)
}

export async function rerunPlaylistCheckItem(checkId: string, itemId: string) {
  return recheckPlaylistCheckItem(getApiClient(), checkId, itemId)
}

export async function downloadPlaylistCheckCsv(id: string) {
  return exportPlaylistCheckCsv(getApiClient(), id)
}

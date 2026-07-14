import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { PlaylistCheck } from '@app/contracts'

export type PlaylistCheckStore = {
  list(): Promise<PlaylistCheck[]>
  get(id: string): Promise<PlaylistCheck | null>
  save(check: PlaylistCheck): Promise<void>
}

type StoreFile = {
  checks: PlaylistCheck[]
}

export function createPlaylistCheckStore(path: string): PlaylistCheckStore {
  async function readStore(): Promise<StoreFile> {
    try {
      const content = await readFile(path, 'utf8')
      return JSON.parse(content) as StoreFile
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return { checks: [] }
      }

      throw error
    }
  }

  async function writeStore(store: StoreFile): Promise<void> {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
  }

  return {
    async list() {
      const store = await readStore()

      return store.checks.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },

    async get(id) {
      const store = await readStore()

      return store.checks.find((check) => check.id === id) ?? null
    },

    async save(check) {
      const store = await readStore()
      const index = store.checks.findIndex((item) => item.id === check.id)

      if (index >= 0) {
        store.checks[index] = check
      } else {
        store.checks.push(check)
      }

      await writeStore(store)
    },
  }
}

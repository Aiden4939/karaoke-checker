import { randomUUID } from 'node:crypto'
import type {
  PlaylistCheck,
  PlaylistCheckItem,
  ProviderResult,
  UpdatePlaylistCheckItemRequest,
} from '@app/contracts'
import { createDamProvider } from '../karaoke/dam-provider.js'
import { createJoysoundProvider } from '../karaoke/joysound-provider.js'
import { searchProvider } from '../karaoke/karaoke-search-service.js'
import type { KaraokeProvider } from '../karaoke/provider.js'
import { parseYoutubeTitle } from '../matching/parse-youtube-title.js'
import { parsePlaylistUrl } from '../youtube/parse-playlist-url.js'
import { createYoutubeClient, type YoutubeClient } from '../youtube/youtube-client.js'
import type { PlaylistCheckStore } from './playlist-check-store.js'

export type PlaylistCheckService = {
  create(playlistUrl: string): Promise<PlaylistCheck>
  process(id: string): Promise<void>
  list(): Promise<PlaylistCheck[]>
  get(id: string): Promise<PlaylistCheck | null>
  updateItem(
    checkId: string,
    itemId: string,
    input: UpdatePlaylistCheckItemRequest,
  ): Promise<PlaylistCheck | null>
  recheckItem(checkId: string, itemId: string): Promise<PlaylistCheck | null>
}

type PlaylistCheckServiceOptions = {
  store: PlaylistCheckStore
  youtubeClient?: YoutubeClient
  youtubeApiKey?: string
  providers?: KaraokeProvider[]
}

function now(): string {
  return new Date().toISOString()
}

function emptyProviderResult(provider: ProviderResult['provider'], query: string): ProviderResult {
  return {
    provider,
    status: 'not_found',
    query,
    matches: [],
  }
}

async function searchProviders(
  providers: KaraokeProvider[],
  item: PlaylistCheckItem,
): Promise<PlaylistCheckItem> {
  const input = {
    songTitle: item.parsed.songTitle,
    artistName: item.parsed.artistName,
  }
  const results = await Promise.all(providers.map((provider) => searchProvider(provider, input)))
  const joysound = results.find((result) => result.provider === 'joysound')
  const dam = results.find((result) => result.provider === 'dam')

  return {
    ...item,
    providers: {
      joysound: joysound ?? emptyProviderResult('joysound', input.songTitle),
      dam: dam ?? emptyProviderResult('dam', input.songTitle),
    },
  }
}

export function createPlaylistCheckService(
  options: PlaylistCheckServiceOptions,
): PlaylistCheckService {
  const youtubeClient = options.youtubeClient ?? createYoutubeClient(options.youtubeApiKey)
  const providers = options.providers ?? [createJoysoundProvider(), createDamProvider()]

  return {
    async create(playlistUrl) {
      const playlistId = parsePlaylistUrl(playlistUrl)
      const timestamp = now()
      const check: PlaylistCheck = {
        id: randomUUID(),
        playlistUrl,
        playlistId,
        status: 'pending',
        totalItems: 0,
        completedItems: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        items: [],
      }

      await options.store.save(check)

      return check
    },

    async process(id) {
      const check = await options.store.get(id)

      if (!check) {
        return
      }

      let nextCheck: PlaylistCheck = {
        ...check,
        status: 'running',
        updatedAt: now(),
      }

      await options.store.save(nextCheck)

      try {
        const playlist = await youtubeClient.getPlaylist(check.playlistId)
        nextCheck = {
          ...nextCheck,
          playlistTitle: playlist.title,
          totalItems: playlist.videos.length,
          completedItems: 0,
          items: playlist.videos.map((video) => {
            const parsed = parseYoutubeTitle(video.title)
            const query = [parsed.songTitle, parsed.artistName].filter(Boolean).join(' ')

            return {
              id: randomUUID(),
              youtubeVideoId: video.videoId,
              youtubeTitle: video.title,
              youtubeChannelTitle: video.channelTitle,
              youtubeUrl: video.url,
              parsed,
              providers: {
                joysound: emptyProviderResult('joysound', query),
                dam: emptyProviderResult('dam', query),
              },
            }
          }),
          updatedAt: now(),
        }
        await options.store.save(nextCheck)

        const processedItems: PlaylistCheckItem[] = []

        for (const item of nextCheck.items) {
          processedItems.push(await searchProviders(providers, item))
          nextCheck = {
            ...nextCheck,
            completedItems: processedItems.length,
            items: [...processedItems, ...nextCheck.items.slice(processedItems.length)],
            updatedAt: now(),
          }
          await options.store.save(nextCheck)
        }

        await options.store.save({
          ...nextCheck,
          status: 'completed',
          updatedAt: now(),
        })
      } catch (error) {
        await options.store.save({
          ...nextCheck,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown playlist check error',
          updatedAt: now(),
        })
      }
    },

    list() {
      return options.store.list()
    },

    get(id) {
      return options.store.get(id)
    },

    async updateItem(checkId, itemId, input) {
      const check = await options.store.get(checkId)

      if (!check) {
        return null
      }

      if (!check.items.some((item) => item.id === itemId)) {
        return null
      }

      const items = check.items.map((item) => {
        if (item.id !== itemId) {
          return item
        }

        return {
          ...item,
          parsed: {
            songTitle: input.songTitle,
            artistName: input.artistName,
            confidence: 'high' as const,
            reasons: ['manual_edit'],
          },
        }
      })
      const nextCheck = {
        ...check,
        items,
        updatedAt: now(),
      }

      await options.store.save(nextCheck)

      return nextCheck
    },

    async recheckItem(checkId, itemId) {
      const check = await options.store.get(checkId)

      if (!check) {
        return null
      }

      const targetItem = check.items.find((item) => item.id === itemId)

      if (!targetItem) {
        return null
      }

      const recheckedItem = await searchProviders(providers, targetItem)
      const nextCheck = {
        ...check,
        items: check.items.map((item) => (item.id === itemId ? recheckedItem : item)),
        updatedAt: now(),
      }

      await options.store.save(nextCheck)

      return nextCheck
    },
  }
}

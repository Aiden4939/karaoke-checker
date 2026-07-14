import { describe, expect, it } from 'vitest'
import type { PlaylistCheck } from '@app/contracts'
import type { KaraokeProvider } from '../karaoke/provider.js'
import type { YoutubeClient } from '../youtube/youtube-client.js'
import { createPlaylistCheckService } from './playlist-check-service.js'
import type { PlaylistCheckStore } from './playlist-check-store.js'

function createMemoryStore(): PlaylistCheckStore {
  const checks = new Map<string, PlaylistCheck>()

  return {
    async list() {
      return Array.from(checks.values())
    },
    async get(id) {
      return checks.get(id) ?? null
    },
    async save(check) {
      checks.set(check.id, check)
    },
  }
}

const youtubeClient: YoutubeClient = {
  async getPlaylist(playlistId) {
    return {
      playlistId,
      title: 'Test playlist',
      videos: [
        {
          videoId: 'video-1',
          title: 'YOASOBI「アイドル」Official Music Video',
          channelTitle: 'YOASOBI',
          url: 'https://www.youtube.com/watch?v=video-1',
        },
      ],
    }
  },
}

function createProvider(name: KaraokeProvider['name']): KaraokeProvider {
  return {
    name,
    async search(input) {
      return [
        {
          title: input.songTitle,
          artist: input.artistName,
          url: `https://example.com/${name}`,
        },
      ]
    },
  }
}

describe('createPlaylistCheckService', () => {
  it('processes a playlist check and stores provider results', async () => {
    const service = createPlaylistCheckService({
      store: createMemoryStore(),
      youtubeClient,
      providers: [createProvider('joysound'), createProvider('dam')],
    })
    const check = await service.create('https://www.youtube.com/playlist?list=PL123')

    await service.process(check.id)

    const processed = await service.get(check.id)

    expect(processed).toMatchObject({
      status: 'completed',
      playlistId: 'PL123',
      playlistTitle: 'Test playlist',
      totalItems: 1,
      completedItems: 1,
    })
    expect(processed?.items[0]).toMatchObject({
      parsed: {
        songTitle: 'アイドル',
        artistName: 'yoasobi',
        confidence: 'high',
      },
      providers: {
        joysound: {
          status: 'found',
        },
        dam: {
          status: 'found',
        },
      },
    })
  })

  it('updates and rechecks one item', async () => {
    const service = createPlaylistCheckService({
      store: createMemoryStore(),
      youtubeClient,
      providers: [createProvider('joysound'), createProvider('dam')],
    })
    const check = await service.create('https://www.youtube.com/playlist?list=PL123')
    await service.process(check.id)
    const processed = await service.get(check.id)
    const itemId = processed?.items[0]?.id

    expect(itemId).toEqual(expect.any(String))

    const updated = await service.updateItem(check.id, itemId ?? '', {
      songTitle: 'Lemon',
      artistName: '米津玄師',
    })

    expect(updated?.items[0]?.parsed).toMatchObject({
      songTitle: 'Lemon',
      artistName: '米津玄師',
      reasons: ['manual_edit'],
    })

    const rechecked = await service.recheckItem(check.id, itemId ?? '')

    expect(rechecked?.items[0]?.providers.joysound.status).toBe('found')
  })

  it('returns null when updating a missing item', async () => {
    const service = createPlaylistCheckService({
      store: createMemoryStore(),
      youtubeClient,
      providers: [createProvider('joysound'), createProvider('dam')],
    })
    const check = await service.create('https://www.youtube.com/playlist?list=PL123')

    await service.process(check.id)

    await expect(
      service.updateItem(check.id, 'missing-item', {
        songTitle: 'Lemon',
      }),
    ).resolves.toBeNull()
  })
})

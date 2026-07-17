import { afterEach, describe, expect, it, vi } from 'vitest'
import { createYoutubeClient } from './youtube-client.js'

describe('createYoutubeClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the video owner channel title instead of the playlist owner channel title', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              snippet: {
                title: 'go!go!vanillas - フォーリン [Music Video]',
                channelTitle: 'Playlist Owner',
                videoOwnerChannelTitle: 'go!go!vanillas',
                resourceId: {
                  videoId: 'video-1',
                },
              },
            },
          ],
        }),
      ),
    )

    const playlist = await createYoutubeClient('test-api-key').getPlaylist('PL123')

    expect(playlist.videos[0]).toMatchObject({
      videoId: 'video-1',
      title: 'go!go!vanillas - フォーリン [Music Video]',
      channelTitle: 'go!go!vanillas',
      url: 'https://www.youtube.com/watch?v=video-1',
    })
  })
})

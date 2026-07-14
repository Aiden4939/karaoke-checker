export type YoutubePlaylistVideo = {
  videoId: string
  title: string
  channelTitle?: string
  url: string
}

export type YoutubePlaylist = {
  playlistId: string
  title?: string
  videos: YoutubePlaylistVideo[]
}

type YoutubePlaylistItemsResponse = {
  nextPageToken?: string
  items?: Array<{
    snippet?: {
      title?: string
      channelTitle?: string
      resourceId?: {
        videoId?: string
      }
    }
  }>
}

export type YoutubeClient = {
  getPlaylist(playlistId: string): Promise<YoutubePlaylist>
}

export function createYoutubeClient(apiKey?: string): YoutubeClient {
  return {
    async getPlaylist(playlistId) {
      if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY is not configured')
      }

      const videos: YoutubePlaylistVideo[] = []
      let pageToken: string | undefined

      do {
        const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
        url.searchParams.set('part', 'snippet')
        url.searchParams.set('maxResults', '50')
        url.searchParams.set('playlistId', playlistId)
        url.searchParams.set('key', apiKey)

        if (pageToken) {
          url.searchParams.set('pageToken', pageToken)
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`YouTube playlist request failed with status ${response.status}`)
        }

        const body = (await response.json()) as YoutubePlaylistItemsResponse

        for (const item of body.items ?? []) {
          const videoId = item.snippet?.resourceId?.videoId
          const title = item.snippet?.title

          if (!videoId || !title || title === 'Deleted video' || title === 'Private video') {
            continue
          }

          videos.push({
            videoId,
            title,
            channelTitle: item.snippet?.channelTitle,
            url: `https://www.youtube.com/watch?v=${videoId}`,
          })
        }

        pageToken = body.nextPageToken
      } while (pageToken)

      return {
        playlistId,
        videos,
      }
    },
  }
}

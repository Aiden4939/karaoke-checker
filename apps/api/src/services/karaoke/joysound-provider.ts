import type { KaraokeMatch } from '@app/contracts'
import type { KaraokeProvider } from './provider.js'
import { extractHtmlSearchMatches, fetchSearchPage } from './html-search.js'

const JOYSOUND_SONG_PATTERN =
  /\\"selSongNo\\":\\"([^\\"]+)\\",\\"naviGroupId\\":\\"([^\\"]+)\\",\\"songName\\":\\"([^\\"]+)\\",\\"artistId\\":\\"([^\\"]*)\\",\\"artistName\\":\\"([^\\"]*)\\"/g

function decodeEscapedValue(value: string): string {
  try {
    return JSON.parse(`"${value}"`) as string
  } catch {
    return value
  }
}

function extractJoysoundMatches(html: string): Omit<KaraokeMatch, 'score'>[] {
  const matches: Omit<KaraokeMatch, 'score'>[] = []
  const seen = new Set<string>()

  for (const match of html.matchAll(JOYSOUND_SONG_PATTERN)) {
    const [, songCode, naviGroupId, songName, , artistName] = match

    if (!songCode || !naviGroupId || !songName) {
      continue
    }

    const key = `${songCode}:${naviGroupId}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)

    const title = decodeEscapedValue(songName)
    const artist = artistName ? decodeEscapedValue(artistName) : undefined

    matches.push({
      title,
      artist,
      url: `https://www.joysound.com/web/search/song/${naviGroupId}`,
      songCode,
      rawText: [title, artist, songCode].filter(Boolean).join(' / '),
    })
  }

  return matches
}

export function createJoysoundProvider(): KaraokeProvider {
  return {
    name: 'joysound',
    async search(input) {
      const url = new URL('https://www.joysound.com/web/search/song')
      url.searchParams.set('keyword', input.songTitle)
      url.searchParams.set('match', '1')

      const html = await fetchSearchPage(url)
      const matches = extractJoysoundMatches(html)

      if (matches.length > 0) {
        return matches
      }

      return extractHtmlSearchMatches(html, input, url.toString())
    },
  }
}

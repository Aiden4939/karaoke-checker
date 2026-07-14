import type { KaraokeMatch } from '@app/contracts'
import { normalizeText } from '../matching/normalize-text.js'
import type { KaraokeSearchInput } from './provider.js'

function stripHtml(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchSearchPage(url: URL): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'karaoke-checker/0.1 local-use',
      accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) {
    throw new Error(`Search request failed with status ${response.status}`)
  }

  return response.text()
}

export function extractHtmlSearchMatches(
  html: string,
  input: KaraokeSearchInput,
  sourceUrl: string,
): Omit<KaraokeMatch, 'score'>[] {
  const text = stripHtml(html)
  const normalizedText = normalizeText(text)
  const normalizedTitle = normalizeText(input.songTitle)
  const normalizedArtist = input.artistName ? normalizeText(input.artistName) : ''

  if (!normalizedText.includes(normalizedTitle)) {
    return []
  }

  if (normalizedArtist && !normalizedText.includes(normalizedArtist)) {
    return [
      {
        title: input.songTitle,
        url: sourceUrl,
        rawText: text.slice(0, 500),
      },
    ]
  }

  return [
    {
      title: input.songTitle,
      artist: input.artistName,
      url: sourceUrl,
      rawText: text.slice(0, 500),
    },
  ]
}

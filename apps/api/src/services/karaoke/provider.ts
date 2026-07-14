import type { KaraokeMatch, KaraokeProviderName } from '@app/contracts'

export type KaraokeSearchInput = {
  songTitle: string
  artistName?: string
}

export type KaraokeProvider = {
  name: KaraokeProviderName
  search(input: KaraokeSearchInput): Promise<Omit<KaraokeMatch, 'score'>[]>
}

export function buildSearchQuery(input: KaraokeSearchInput): string {
  return [input.songTitle, input.artistName].filter(Boolean).join(' ')
}

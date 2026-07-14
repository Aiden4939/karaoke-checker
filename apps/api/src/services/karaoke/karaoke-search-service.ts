import type { ProviderResult } from '@app/contracts'
import { scoreMatches } from '../matching/score-match.js'
import type { KaraokeProvider, KaraokeSearchInput } from './provider.js'

export async function searchProvider(
  provider: KaraokeProvider,
  input: KaraokeSearchInput,
): Promise<ProviderResult> {
  const query = [input.songTitle, input.artistName].filter(Boolean).join(' ')

  try {
    const matches = await provider.search(input)
    const scored = scoreMatches({
      ...input,
      matches,
    })

    return {
      provider: provider.name,
      status: scored.status,
      query,
      matches: scored.matches,
    }
  } catch (error) {
    return {
      provider: provider.name,
      status: 'error',
      query,
      matches: [],
      errorMessage: error instanceof Error ? error.message : 'Unknown provider error',
    }
  }
}

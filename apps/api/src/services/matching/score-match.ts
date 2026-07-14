import type { KaraokeMatch, ProviderMatchStatus } from '@app/contracts'
import { normalizeText } from './normalize-text.js'

export type ScoreMatchInput = {
  songTitle: string
  artistName?: string
  matches: Omit<KaraokeMatch, 'score'>[]
}

export type ScoreMatchResult = {
  status: ProviderMatchStatus
  matches: KaraokeMatch[]
}

function includesEither(left: string, right: string): boolean {
  return left.includes(right) || right.includes(left)
}

function scoreOneMatch(input: ScoreMatchInput, match: Omit<KaraokeMatch, 'score'>): number {
  const expectedTitle = normalizeText(input.songTitle)
  const actualTitle = normalizeText(match.title)
  const expectedArtist = input.artistName ? normalizeText(input.artistName) : ''
  const actualArtist = match.artist ? normalizeText(match.artist) : ''
  let score = 0

  if (expectedTitle === actualTitle) {
    score += 0.7
  } else if (includesEither(expectedTitle, actualTitle)) {
    score += 0.45
  }

  if (expectedArtist && actualArtist) {
    if (expectedArtist === actualArtist) {
      score += 0.25
    } else if (includesEither(expectedArtist, actualArtist)) {
      score += 0.15
    }
  }

  if (!expectedArtist) {
    score += 0.05
  }

  return Math.min(1, Number(score.toFixed(2)))
}

export function scoreMatches(input: ScoreMatchInput): ScoreMatchResult {
  if (input.matches.length === 0) {
    return {
      status: 'not_found',
      matches: [],
    }
  }

  const matches = input.matches
    .map((match) => ({
      ...match,
      score: scoreOneMatch(input, match),
    }))
    .sort((left, right) => right.score - left.score)

  const bestScore = matches[0]?.score ?? 0
  const closeMatches = matches.filter(
    (match) => bestScore - match.score <= 0.1 && match.score >= 0.6,
  )

  if (bestScore >= 0.85 && closeMatches.length <= 1) {
    return {
      status: 'found',
      matches,
    }
  }

  if (bestScore >= 0.6) {
    return {
      status: 'ambiguous',
      matches,
    }
  }

  return {
    status: 'not_found',
    matches,
  }
}

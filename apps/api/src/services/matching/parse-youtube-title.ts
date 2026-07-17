import type { ParsedSong } from '@app/contracts'
import { hasNoiseMarker, normalizeText } from './normalize-text.js'

type Candidate = {
  songTitle: string
  artistName?: string
  score: number
  reasons: string[]
}

const COMPILATION_MARKERS = [/メドレー/g, /\bmedley\b/gi, /作業用\s*bgm/gi, /名曲集/g, /まとめ/g]
const VERSION_MARKERS = [/\bthe first take\b/gi, /\blive\b/gi, /\bremix\b/gi, /from /gi]
const COVER_MARKERS = [/\bcover(ed)?\b/gi, /歌ってみた/g]

function removeFeaturedArtist(value: string): string {
  return value.replace(/\s+(?:feat\.?|featuring|ft\.?)\s*.+$/i, '').trim()
}

function cleanCandidate(value: string): string {
  return value
    .replace(/[\[(（][^\])）]*[\])）]/g, ' ')
    .replace(
      /[【《][^】》]*(?:official|music\s*video|mv|pv|lyric|lyrics|歌詞)[^】》]*[】》]/gi,
      ' ',
    )
    .replace(/\b(?:official\s*)?(?:music\s*)?(?:video|mv|pv)\b/gi, ' ')
    .replace(/\blyrics?\b/gi, ' ')
    .replace(/歌詞付き?/g, ' ')
    .replace(/歌ってみた/g, ' ')
    .replace(/^["'「『“”]+|["'」』“”]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[-/／|｜\s]+|[-/／|｜\s]+$/g, '')
    .trim()
}

function cleanSongCandidate(value: string): string {
  return removeFeaturedArtist(cleanCandidate(value))
}

function cleanArtistCandidate(value: string): string {
  return removeFeaturedArtist(
    value
      .replace(
        /[【《][^】》]*(?:official|music\s*video|mv|pv|lyric|lyrics|歌詞)[^】》]*[】》]/gi,
        ' ',
      )
      .replace(/\b(?:official\s*)?(?:music\s*)?(?:video|mv|pv)\b/gi, ' ')
      .replace(/\blyrics?\b/gi, ' ')
      .replace(/歌詞付き?/g, ' ')
      .replace(/歌ってみた/g, ' ')
      .replace(/^["'「『“”]+|["'」』“”]+$/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[-/／|｜\s]+|[-/／|｜\s]+$/g, ''),
  ).trim()
}

function isReasonableCandidate(value: string): boolean {
  const normalized = normalizeText(value)

  return (
    normalized.length >= 1 &&
    normalized.length <= 80 &&
    normalized !== 'official' &&
    normalized !== 'mv'
  )
}

function confidenceFromScore(score: number): ParsedSong['confidence'] {
  if (score >= 70) {
    return 'high'
  }

  if (score >= 45) {
    return 'medium'
  }

  return 'low'
}

function buildCandidate(
  songTitle: string,
  artistName: string | undefined,
  score: number,
  reasons: string[],
): Candidate {
  const cleanedSongTitle = cleanSongCandidate(songTitle)
  const cleanedArtistName = artistName ? cleanArtistCandidate(artistName) : undefined
  const nextReasons = [...reasons]
  let nextScore = score

  if (cleanedArtistName) {
    nextScore += 15
    nextReasons.push('has_artist_candidate')
  }

  if (isReasonableCandidate(cleanedSongTitle)) {
    nextScore += 15
    nextReasons.push('has_song_candidate')
  } else {
    nextScore -= 25
    nextReasons.push('unreasonable_song_candidate')
  }

  return {
    songTitle: cleanedSongTitle,
    artistName: cleanedArtistName || undefined,
    score: nextScore,
    reasons: nextReasons,
  }
}

function applyPenalty(candidate: Candidate, title: string): Candidate {
  let score = candidate.score
  const reasons = [...candidate.reasons]

  if (hasNoiseMarker(title)) {
    score -= 8
    reasons.push('contains_noise_marker')
  }

  if (VERSION_MARKERS.some((pattern) => pattern.test(title))) {
    score -= 10
    reasons.push('contains_version_marker')
  }

  if (COVER_MARKERS.some((pattern) => pattern.test(title))) {
    score -= 25
    reasons.push('contains_cover_marker')
  }

  if (COMPILATION_MARKERS.some((pattern) => pattern.test(title))) {
    score -= 35
    reasons.push('looks_like_compilation')
  }

  if (title.split(/[\/|]/).length > 3) {
    score -= 20
    reasons.push('too_many_segments')
  }

  return {
    ...candidate,
    score,
    reasons,
  }
}

export function parseYoutubeTitle(title: string): ParsedSong {
  const normalizedTitle = normalizeText(title)
  const candidates: Candidate[] = []

  const quoteMatch = title.match(/^(.+?)[「『](.+?)[」』]/)
  if (quoteMatch) {
    candidates.push(
      buildCandidate(quoteMatch[2] ?? '', quoteMatch[1], 50, ['matched_japanese_quote_pattern']),
    )
  }

  const westernQuoteMatch = title.match(/^(.+?)[“"](.+?)[”"]/)
  if (westernQuoteMatch) {
    candidates.push(
      buildCandidate(westernQuoteMatch[2] ?? '', westernQuoteMatch[1], 50, [
        'matched_western_quote_pattern',
      ]),
    )
  }

  const dashMatch = title.match(/^(.+?)\s+[‐‑‒–—―-]\s+(.+)$/)
  if (dashMatch) {
    candidates.push(
      buildCandidate(dashMatch[2] ?? '', dashMatch[1], 40, ['matched_artist_dash_title']),
    )
  }

  const pipeMatch = title.match(/^(.+?)\s*[|｜]\s*(.+)$/)
  if (pipeMatch) {
    candidates.push(
      buildCandidate(pipeMatch[2] ?? '', pipeMatch[1], 36, ['matched_artist_pipe_title']),
    )
  }

  const slashMatch = title.match(/^(.+?)\s+[\/／]\s+(.+)$/)
  if (slashMatch) {
    candidates.push(
      buildCandidate(slashMatch[2] ?? '', slashMatch[1], 32, ['matched_artist_slash_title']),
    )
  }

  const compactSlashMatch = title.match(/^([^/／]+)[/／]([^/／]+)$/)
  if (compactSlashMatch) {
    candidates.push(
      buildCandidate(compactSlashMatch[1] ?? '', compactSlashMatch[2], 30, [
        'matched_title_slash_artist',
      ]),
    )
  }

  const bracketArtistMatch = title.match(/^【([^】]+)】(.+)$/)
  if (bracketArtistMatch) {
    candidates.push(
      buildCandidate(bracketArtistMatch[2] ?? '', bracketArtistMatch[1], 35, [
        'matched_bracket_artist_pattern',
      ]),
    )
  }

  const byMatch = title.match(/^(.+?)\s+by\s+(.+)$/i)
  if (byMatch) {
    candidates.push(buildCandidate(byMatch[1] ?? '', byMatch[2], 28, ['matched_title_by_artist']))
  }

  if (candidates.length === 0) {
    candidates.push(buildCandidate(title, undefined, 10, ['no_reliable_pattern']))
  }

  const [bestCandidate] = candidates
    .map((candidate) => applyPenalty(candidate, normalizedTitle))
    .sort((left, right) => right.score - left.score)

  const fallbackSongTitle = cleanSongCandidate(title) || title.trim()
  const songTitle = bestCandidate?.songTitle || fallbackSongTitle
  const score = bestCandidate?.score ?? 0

  return {
    songTitle,
    artistName: bestCandidate?.artistName,
    confidence: confidenceFromScore(score),
    reasons: bestCandidate?.reasons ?? ['no_reliable_pattern'],
  }
}

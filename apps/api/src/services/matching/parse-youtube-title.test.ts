import { describe, expect, it } from 'vitest'
import { parseYoutubeTitle } from './parse-youtube-title.js'

describe('parseYoutubeTitle', () => {
  it('parses artist dash title format with high confidence', () => {
    expect(parseYoutubeTitle('米津玄師 - Lemon')).toMatchObject({
      songTitle: 'lemon',
      artistName: '米津玄師',
      confidence: 'high',
    })
  })

  it('parses Japanese quote format with high confidence', () => {
    expect(parseYoutubeTitle('YOASOBI「アイドル」Official Music Video')).toMatchObject({
      songTitle: 'アイドル',
      artistName: 'yoasobi',
      confidence: 'high',
    })
  })

  it('marks single segment titles as low confidence', () => {
    expect(parseYoutubeTitle('Lemon')).toMatchObject({
      songTitle: 'lemon',
      confidence: 'low',
    })
  })

  it('penalizes compilation titles', () => {
    const parsed = parseYoutubeTitle('2024年おすすめカラオケ人気曲メドレー')

    expect(parsed.confidence).toBe('low')
    expect(parsed.reasons).toContain('looks_like_compilation')
  })
})

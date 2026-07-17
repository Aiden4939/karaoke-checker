import { describe, expect, it } from 'vitest'
import { parseYoutubeTitle } from './parse-youtube-title.js'

describe('parseYoutubeTitle', () => {
  it('parses artist dash title format with high confidence', () => {
    expect(parseYoutubeTitle('米津玄師 - Lemon')).toMatchObject({
      songTitle: 'Lemon',
      artistName: '米津玄師',
      confidence: 'high',
    })
  })

  it('parses Japanese quote format with high confidence', () => {
    expect(parseYoutubeTitle('YOASOBI「アイドル」Official Music Video')).toMatchObject({
      songTitle: 'アイドル',
      artistName: 'YOASOBI',
      confidence: 'high',
    })
  })

  it('removes trailing separators from quote pattern artists', () => {
    expect(parseYoutubeTitle('リーガルリリー - 『ニコの涙』Music Video')).toMatchObject({
      songTitle: 'ニコの涙',
      artistName: 'リーガルリリー',
      confidence: 'high',
    })
  })

  it('marks single segment titles as low confidence', () => {
    expect(parseYoutubeTitle('Lemon')).toMatchObject({
      songTitle: 'Lemon',
      confidence: 'low',
    })
  })

  it('preserves artist punctuation and casing in parsed output', () => {
    expect(parseYoutubeTitle('go!go!vanillas - フォーリン [Music Video]')).toMatchObject({
      songTitle: 'フォーリン',
      artistName: 'go!go!vanillas',
      confidence: 'medium',
    })
  })

  it('preserves song punctuation and full-width artist separators', () => {
    expect(
      parseYoutubeTitle('stb ＆ NEA - キミのせいだ。 (Because of You) 【Official Music Video】'),
    ).toMatchObject({
      songTitle: 'キミのせいだ。',
      artistName: 'stb ＆ NEA',
      confidence: 'medium',
    })
  })

  it('parses western quote title format without lowercasing artist names', () => {
    expect(parseYoutubeTitle('PEOPLE 1 “金字塔” （Official Video）')).toMatchObject({
      songTitle: '金字塔',
      artistName: 'PEOPLE 1',
      confidence: 'high',
    })
  })

  it('removes featured artists from parsed artist names', () => {
    expect(parseYoutubeTitle('西野カナ feat. NiziU『LOVE BEAT』MV Full')).toMatchObject({
      songTitle: 'LOVE BEAT',
      artistName: '西野カナ',
      confidence: 'high',
    })

    expect(parseYoutubeTitle('Artist ft. Guest - Song')).toMatchObject({
      songTitle: 'Song',
      artistName: 'Artist',
      confidence: 'high',
    })
  })

  it('preserves parenthesized artist names', () => {
    expect(parseYoutubeTitle('(sic)boy - Falling Down (Prod.Zakk Cervini)')).toMatchObject({
      songTitle: 'Falling Down',
      artistName: '(sic)boy',
      confidence: 'high',
    })
  })

  it('parses artist pipe title format', () => {
    expect(parseYoutubeTitle('Omoinotake | 幸せ【Official Music Video】')).toMatchObject({
      songTitle: '幸せ',
      artistName: 'Omoinotake',
      confidence: 'medium',
    })
  })

  it('parses compact title slash artist format', () => {
    expect(parseYoutubeTitle('光のありか／CHiCO')).toMatchObject({
      songTitle: '光のありか',
      artistName: 'CHiCO',
      confidence: 'medium',
    })
  })

  it('removes featured artists from parsed song titles', () => {
    expect(parseYoutubeTitle('*Luna - NPC feat.ねんね')).toMatchObject({
      songTitle: 'NPC',
      artistName: '*Luna',
      confidence: 'high',
    })

    expect(parseYoutubeTitle('BAK『レプリカ feat. IKE』Official Music Video')).toMatchObject({
      songTitle: 'レプリカ',
      artistName: 'BAK',
      confidence: 'high',
    })
  })

  it('penalizes compilation titles', () => {
    const parsed = parseYoutubeTitle('2024年おすすめカラオケ人気曲メドレー')

    expect(parsed.confidence).toBe('low')
    expect(parsed.reasons).toContain('looks_like_compilation')
  })
})

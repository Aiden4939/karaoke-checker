import { describe, expect, it } from 'vitest'
import { scoreMatches } from './score-match.js'

describe('scoreMatches', () => {
  it('marks a strong title and artist match as found', () => {
    expect(
      scoreMatches({
        songTitle: 'アイドル',
        artistName: 'YOASOBI',
        matches: [
          {
            title: 'アイドル',
            artist: 'YOASOBI',
          },
        ],
      }),
    ).toMatchObject({
      status: 'found',
      matches: [
        {
          score: 0.95,
        },
      ],
    })
  })

  it('marks no candidates as not found', () => {
    expect(
      scoreMatches({
        songTitle: 'アイドル',
        matches: [],
      }),
    ).toEqual({
      status: 'not_found',
      matches: [],
    })
  })

  it('marks partial matches as ambiguous', () => {
    expect(
      scoreMatches({
        songTitle: 'アイドル',
        artistName: 'YOASOBI',
        matches: [
          {
            title: 'アイドル live',
            artist: 'YOASOBI',
          },
        ],
      }).status,
    ).toBe('ambiguous')
  })
})

import { describe, expect, it } from 'vitest'
import { extractHtmlSearchMatches } from './html-search.js'

describe('extractHtmlSearchMatches', () => {
  it('returns no matches when the search page reports zero song results', () => {
    const matches = extractHtmlSearchMatches(
      `
        <html>
          <body>
            <h1>"andrew willis skatepark engineer"を含む曲検索結果</h1>
            <nav>すべて (0件) 曲 (0件) 歌手 (0件)</nav>
            <p>「該当データがありません」</p>
          </body>
        </html>
      `,
      {
        songTitle: 'andrew willis skatepark engineer',
      },
      'https://www.joysound.com/web/search/song?keyword=andrew',
    )

    expect(matches).toEqual([])
  })
})

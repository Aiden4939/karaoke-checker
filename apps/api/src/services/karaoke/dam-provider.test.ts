import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDamProvider } from './dam-provider.js'

describe('createDamProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps DAM search API results to karaoke matches', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {
            statusCode: '0000',
            message: '成功',
          },
          list: [
            {
              requestNo: '3246-51',
              title: 'Lemon',
              artist: '米津玄師',
            },
          ],
        }),
      ),
    )

    const matches = await createDamProvider().search({
      songTitle: 'Lemon',
      artistName: '米津玄師',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.clubdam.com/dkwebsys/search-api/SearchVariousByKeywordApi',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"keyword":"Lemon 米津玄師"'),
      }),
    )
    expect(matches).toEqual([
      {
        title: 'Lemon',
        artist: '米津玄師',
        url: 'https://www.clubdam.com/karaokesearch/songleaf.html?requestNo=3246-51',
        songCode: '3246-51',
        rawText: 'Lemon / 米津玄師 / 3246-51',
      },
    ])
  })
})

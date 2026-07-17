import { afterEach, describe, expect, it, vi } from 'vitest'
import { createJoysoundProvider } from './joysound-provider.js'

describe('createJoysoundProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps JOYSOUND song search payload results to karaoke matches', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(`
        <script>
          self.__next_f.push([1,"{\\"selSongNo\\":\\"425691\\",\\"naviGroupId\\":\\"669975\\",\\"songName\\":\\"Lemon\\",\\"artistId\\":\\"232873\\",\\"artistName\\":\\"米津玄師\\"}"])
        </script>
      `),
    )

    const matches = await createJoysoundProvider().search({
      songTitle: 'Lemon',
      artistName: '米津玄師',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'https://www.joysound.com/web/search/song?keyword=Lemon&match=1',
      }),
      expect.anything(),
    )
    expect(matches).toEqual([
      {
        title: 'Lemon',
        artist: '米津玄師',
        url: 'https://www.joysound.com/web/search/song/669975',
        songCode: '425691',
        rawText: 'Lemon / 米津玄師 / 425691',
      },
    ])
  })
})

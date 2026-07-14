import { describe, expect, it } from 'vitest'
import { parsePlaylistUrl } from './parse-playlist-url.js'

describe('parsePlaylistUrl', () => {
  it('extracts playlist id from a YouTube playlist URL', () => {
    expect(parsePlaylistUrl('https://www.youtube.com/playlist?list=PL123')).toBe('PL123')
  })

  it('extracts playlist id from a YouTube Music playlist URL', () => {
    expect(parsePlaylistUrl('https://music.youtube.com/playlist?list=PL456')).toBe('PL456')
  })

  it('rejects URLs without a list parameter', () => {
    expect(() => parsePlaylistUrl('https://www.youtube.com/watch?v=abc')).toThrow(
      'YouTube playlist URL must include a list parameter',
    )
  })
})

import { buildSearchQuery, type KaraokeProvider } from './provider.js'
import { extractHtmlSearchMatches, fetchSearchPage } from './html-search.js'

export function createJoysoundProvider(): KaraokeProvider {
  return {
    name: 'joysound',
    async search(input) {
      const url = new URL('https://www.joysound.com/web/search/song')
      url.searchParams.set('keyword', buildSearchQuery(input))
      url.searchParams.set('match', '1')

      const html = await fetchSearchPage(url)

      return extractHtmlSearchMatches(html, input, url.toString())
    },
  }
}

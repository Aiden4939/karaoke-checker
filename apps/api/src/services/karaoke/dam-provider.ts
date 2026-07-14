import { buildSearchQuery, type KaraokeProvider } from './provider.js'
import { extractHtmlSearchMatches, fetchSearchPage } from './html-search.js'

export function createDamProvider(): KaraokeProvider {
  return {
    name: 'dam',
    async search(input) {
      const url = new URL('https://www.clubdam.com/karaokesearch/')
      url.searchParams.set('keyword', buildSearchQuery(input))

      const html = await fetchSearchPage(url)

      return extractHtmlSearchMatches(html, input, url.toString())
    },
  }
}

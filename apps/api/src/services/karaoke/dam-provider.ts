import type { KaraokeMatch } from '@app/contracts'
import { buildSearchQuery, type KaraokeProvider } from './provider.js'

type DamSearchResponse = {
  result?: {
    statusCode?: string
    message?: string
  }
  list?: Array<{
    requestNo?: string
    title?: string
    artist?: string
  }>
}

async function searchDamApi(query: string): Promise<Omit<KaraokeMatch, 'score'>[]> {
  const response = await fetch(
    'https://www.clubdam.com/dkwebsys/search-api/SearchVariousByKeywordApi',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'karaoke-checker/0.1 local-use',
      },
      body: JSON.stringify({
        modelTypeCode: '1',
        serialNo: 'BA000001',
        keyword: query,
        compId: '1',
        authKey: '2/Qb9R@8s*',
        sort: '1',
        dispCount: '20',
        pageNo: '1',
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`DAM search request failed with status ${response.status}`)
  }

  const body = (await response.json()) as DamSearchResponse

  if (body.result?.statusCode && body.result.statusCode !== '0000') {
    throw new Error(`DAM search request failed with status ${body.result.statusCode}`)
  }

  return (body.list ?? [])
    .filter((item) => item.title && item.artist)
    .map((item) => ({
      title: item.title ?? '',
      artist: item.artist,
      url: item.requestNo
        ? `https://www.clubdam.com/karaokesearch/songleaf.html?requestNo=${encodeURIComponent(item.requestNo)}`
        : 'https://www.clubdam.com/karaokesearch/',
      songCode: item.requestNo,
      rawText: [item.title, item.artist, item.requestNo].filter(Boolean).join(' / '),
    }))
}

export function createDamProvider(): KaraokeProvider {
  return {
    name: 'dam',
    async search(input) {
      return searchDamApi(buildSearchQuery(input))
    },
  }
}

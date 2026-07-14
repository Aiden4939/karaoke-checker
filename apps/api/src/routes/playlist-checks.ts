import {
  createPlaylistCheckRequestSchema,
  updatePlaylistCheckItemRequestSchema,
  type PlaylistCheck,
} from '@app/contracts'
import { Hono } from 'hono'
import { zValidator } from '../lib/validation.js'
import { getRequestId } from '../middleware/request-id.js'
import type { PlaylistCheckService } from '../services/playlist-check/playlist-check-service.js'
import type { AppBindings } from '../app.js'

function escapeCsv(value: string | number | undefined): string {
  const text = value === undefined ? '' : String(value)

  return `"${text.replace(/"/g, '""')}"`
}

function toCsv(check: PlaylistCheck): string {
  const rows = [
    [
      'youtubeTitle',
      'youtubeUrl',
      'songTitle',
      'artistName',
      'confidence',
      'joysoundStatus',
      'damStatus',
      'joysoundTopScore',
      'damTopScore',
    ],
    ...check.items.map((item) => [
      item.youtubeTitle,
      item.youtubeUrl,
      item.parsed.songTitle,
      item.parsed.artistName ?? '',
      item.parsed.confidence,
      item.providers.joysound.status,
      item.providers.dam.status,
      item.providers.joysound.matches[0]?.score ?? '',
      item.providers.dam.matches[0]?.score ?? '',
    ]),
  ]

  return `${rows.map((row) => row.map(escapeCsv).join(',')).join('\n')}\n`
}

export function createPlaylistCheckRoutes(service: PlaylistCheckService) {
  const route = new Hono<AppBindings>()
    .get('/', async (c) => {
      const checks = await service.list()

      return c.json({
        data: {
          checks,
        },
        meta: {
          requestId: getRequestId(c),
        },
      })
    })
    .post('/', zValidator('json', createPlaylistCheckRequestSchema), async (c) => {
      const input = c.req.valid('json')
      const check = await service.create(input.playlistUrl)

      void service.process(check.id)

      return c.json(
        {
          data: {
            id: check.id,
            status: 'running',
          },
          meta: {
            requestId: getRequestId(c),
          },
        },
        201,
      )
    })
    .get('/:id', async (c) => {
      const check = await service.get(c.req.param('id'))

      if (!check) {
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Playlist check not found',
              details: [],
              requestId: getRequestId(c),
            },
          },
          404,
        )
      }

      return c.json({
        data: check,
        meta: {
          requestId: getRequestId(c),
        },
      })
    })
    .patch(
      '/:checkId/items/:itemId',
      zValidator('json', updatePlaylistCheckItemRequestSchema),
      async (c) => {
        const input = c.req.valid('json')
        const check = await service.updateItem(c.req.param('checkId'), c.req.param('itemId'), input)

        if (!check) {
          return c.json(
            {
              error: {
                code: 'NOT_FOUND',
                message: 'Playlist check item not found',
                details: [],
                requestId: getRequestId(c),
              },
            },
            404,
          )
        }

        return c.json({
          data: check,
          meta: {
            requestId: getRequestId(c),
          },
        })
      },
    )
    .post('/:checkId/items/:itemId/recheck', async (c) => {
      const check = await service.recheckItem(c.req.param('checkId'), c.req.param('itemId'))

      if (!check) {
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Playlist check item not found',
              details: [],
              requestId: getRequestId(c),
            },
          },
          404,
        )
      }

      return c.json({
        data: check,
        meta: {
          requestId: getRequestId(c),
        },
      })
    })
    .get('/:id/export.json', async (c) => {
      const check = await service.get(c.req.param('id'))

      if (!check) {
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Playlist check not found',
              details: [],
              requestId: getRequestId(c),
            },
          },
          404,
        )
      }

      return c.json({
        data: check,
        meta: {
          requestId: getRequestId(c),
        },
      })
    })
    .get('/:id/export.csv', async (c) => {
      const check = await service.get(c.req.param('id'))

      if (!check) {
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Playlist check not found',
              details: [],
              requestId: getRequestId(c),
            },
          },
          404,
        )
      }

      return new Response(toCsv(check), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
        },
      })
    })

  return route
}

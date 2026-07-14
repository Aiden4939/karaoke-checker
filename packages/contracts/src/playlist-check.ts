import { z } from 'zod'
import { responseMetaSchema } from './health.js'

export const playlistCheckStatusSchema = z.enum(['pending', 'running', 'completed', 'failed'])
export const parseConfidenceSchema = z.enum(['low', 'medium', 'high'])
export const karaokeProviderNameSchema = z.enum(['joysound', 'dam'])
export const providerMatchStatusSchema = z.enum(['found', 'not_found', 'ambiguous', 'error'])

function isYoutubePlaylistUrl(value: string): boolean {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    const isYoutubeHost =
      hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be'

    return isYoutubeHost && Boolean(url.searchParams.get('list'))
  } catch {
    return false
  }
}

export const createPlaylistCheckRequestSchema = z.object({
  playlistUrl: z
    .string()
    .url()
    .refine(isYoutubePlaylistUrl, 'Playlist URL must be a YouTube URL with a list parameter'),
})

export const createPlaylistCheckDataSchema = z.object({
  id: z.string(),
  status: playlistCheckStatusSchema,
})

export const createPlaylistCheckResponseSchema = z.object({
  data: createPlaylistCheckDataSchema,
  meta: responseMetaSchema,
})

export const updatePlaylistCheckItemRequestSchema = z.object({
  songTitle: z.string().trim().min(1),
  artistName: z.string().trim().optional(),
})

export const parsedSongSchema = z.object({
  songTitle: z.string(),
  artistName: z.string().optional(),
  confidence: parseConfidenceSchema,
  reasons: z.array(z.string()),
})

export const karaokeMatchSchema = z.object({
  title: z.string(),
  artist: z.string().optional(),
  url: z.string().url().optional(),
  songCode: z.string().optional(),
  score: z.number().min(0).max(1),
  rawText: z.string().optional(),
})

export const providerResultSchema = z.object({
  provider: karaokeProviderNameSchema,
  status: providerMatchStatusSchema,
  query: z.string(),
  matches: z.array(karaokeMatchSchema),
  errorMessage: z.string().optional(),
})

export const playlistCheckItemSchema = z.object({
  id: z.string(),
  youtubeVideoId: z.string(),
  youtubeTitle: z.string(),
  youtubeChannelTitle: z.string().optional(),
  youtubeUrl: z.string().url(),
  parsed: parsedSongSchema,
  providers: z.object({
    joysound: providerResultSchema,
    dam: providerResultSchema,
  }),
})

export const playlistCheckSchema = z.object({
  id: z.string(),
  playlistUrl: z.string().url(),
  playlistId: z.string(),
  playlistTitle: z.string().optional(),
  status: playlistCheckStatusSchema,
  totalItems: z.number().int().nonnegative(),
  completedItems: z.number().int().nonnegative(),
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(playlistCheckItemSchema),
})

export const playlistCheckResponseSchema = z.object({
  data: playlistCheckSchema,
  meta: responseMetaSchema,
})

export const playlistChecksListResponseSchema = z.object({
  data: z.object({
    checks: z.array(playlistCheckSchema),
  }),
  meta: responseMetaSchema,
})

export type PlaylistCheckStatus = z.infer<typeof playlistCheckStatusSchema>
export type ParseConfidence = z.infer<typeof parseConfidenceSchema>
export type KaraokeProviderName = z.infer<typeof karaokeProviderNameSchema>
export type ProviderMatchStatus = z.infer<typeof providerMatchStatusSchema>
export type CreatePlaylistCheckRequest = z.infer<typeof createPlaylistCheckRequestSchema>
export type CreatePlaylistCheckResponse = z.infer<typeof createPlaylistCheckResponseSchema>
export type UpdatePlaylistCheckItemRequest = z.infer<typeof updatePlaylistCheckItemRequestSchema>
export type ParsedSong = z.infer<typeof parsedSongSchema>
export type KaraokeMatch = z.infer<typeof karaokeMatchSchema>
export type ProviderResult = z.infer<typeof providerResultSchema>
export type PlaylistCheckItem = z.infer<typeof playlistCheckItemSchema>
export type PlaylistCheck = z.infer<typeof playlistCheckSchema>
export type PlaylistCheckResponse = z.infer<typeof playlistCheckResponseSchema>
export type PlaylistChecksListResponse = z.infer<typeof playlistChecksListResponseSchema>

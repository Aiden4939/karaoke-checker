# YouTube Playlist Karaoke Checker

## Goal

Build a local-use karaoke checker that accepts a YouTube playlist URL, imports the playlist videos, parses each title into a likely song title and artist name, queries JOYSOUND and DAM, scores candidate matches, persists the check result locally, and lets the user review, edit, recheck, and export results.

## Non-goals

- Do not add authentication.
- Do not add a remote database.
- Do not let the web app call external services directly.
- Do not introduce a new frontend architecture.
- Do not make OpenAI parsing a required path.

## Architecture

- Frontend remains in `apps/web`.
- API remains in `apps/api`.
- Shared request and response contracts live in `packages/contracts`.
- Frontend calls API only through `@app/api-client`.
- API routes stay thin; orchestration and external access live in services.
- Local persistence uses a JSON file store for this implementation to avoid adding a database dependency. The store can be replaced by SQLite later behind the same repository interface.

## User Flow

1. User enters a YouTube playlist URL.
2. API creates a playlist check record.
3. API imports all playlist videos through YouTube Data API when `YOUTUBE_API_KEY` is configured.
4. If `YOUTUBE_API_KEY` is not configured, API can still run against an optional development sample payload in tests, but production requests return a configuration error.
5. API parses each YouTube title into `songTitle`, `artistName`, `confidence`, and parser reasons.
6. API queries JOYSOUND and DAM for each parsed song.
7. API scores provider results and stores match status per provider.
8. Frontend polls the check detail until it reaches `completed` or `failed`.
9. User reviews the result table.
10. User can edit `songTitle` / `artistName` for one item and recheck that item.
11. User can export JSON or CSV.

## API

### Create Playlist Check

`POST /playlist-checks`

Request:

```json
{
  "playlistUrl": "https://www.youtube.com/playlist?list=..."
}
```

Response:

```json
{
  "data": {
    "id": "check-id",
    "status": "running"
  },
  "meta": {
    "requestId": "..."
  }
}
```

### Get Playlist Check

`GET /playlist-checks/:id`

Returns the playlist metadata, progress, items, parsed song fields, provider statuses, and candidate matches.

### Update Item Parse Fields

`PATCH /playlist-checks/:checkId/items/:itemId`

Request:

```json
{
  "songTitle": "アイドル",
  "artistName": "YOASOBI"
}
```

### Recheck Item

`POST /playlist-checks/:checkId/items/:itemId/recheck`

Re-runs JOYSOUND and DAM provider queries for one item using its current parsed song fields.

### Export

`GET /playlist-checks/:id/export.json`

Returns full normalized result JSON.

`GET /playlist-checks/:id/export.csv`

Returns CSV with one row per YouTube item.

## Data Model

`PlaylistCheck`

- `id`
- `playlistUrl`
- `playlistId`
- `playlistTitle`
- `status`: `pending | running | completed | failed`
- `totalItems`
- `completedItems`
- `errorMessage`
- `createdAt`
- `updatedAt`
- `items`

`PlaylistCheckItem`

- `id`
- `youtubeVideoId`
- `youtubeTitle`
- `youtubeChannelTitle`
- `youtubeUrl`
- `parsed.songTitle`
- `parsed.artistName`
- `parsed.confidence`: `low | medium | high`
- `parsed.reasons`
- `providers.joysound`
- `providers.dam`

`ProviderResult`

- `provider`: `joysound | dam`
- `status`: `found | not_found | ambiguous | error`
- `query`
- `matches`
- `errorMessage`

`KaraokeMatch`

- `title`
- `artist`
- `url`
- `songCode`
- `score`
- `rawText`

## Title Parsing

The first implementation uses deterministic parsing rules.

High confidence examples:

- `米津玄師 - Lemon`
- `YOASOBI「アイドル」`
- `Official髭男dism - Pretender`
- `Aimer / 残響散歌`
- `宇多田ヒカル『First Love』`

Medium confidence examples:

- `LiSA - 炎 / THE FIRST TAKE`
- `King Gnu - 白日 Live`
- `Ado - 新時代 (ウタ from ONE PIECE FILM RED)`

Low confidence examples:

- `Lemon`
- `2024年おすすめカラオケ人気曲メドレー`
- `YOASOBI / アイドル / 推しの子 / Official Music Video`
- `Lemon / 米津玄師 cover by ...`

Parser output always includes the best available guess plus reasons. Low confidence means the guess is not reliable, not that parsing produced no output.

## Matching

Provider candidate scores are deterministic:

- Strong title equality after normalization scores highest.
- Partial title match scores lower.
- Artist equality adds score.
- Provider errors affect only that provider.
- No result becomes `not_found`.
- One strong result becomes `found`.
- Multiple close results become `ambiguous`.

Thresholds:

- `score >= 0.85`: `found`
- `score >= 0.6`: `ambiguous`
- otherwise `not_found`

## OpenAI

OpenAI parsing is not required for this implementation. The parser interface should leave room for a future `OpenAiTitleParser`, used only as a fallback for low-confidence titles.

## Frontend

The home page is the tool.

Required UI:

- Playlist URL input.
- Submit button.
- Loading/progress state.
- Summary counts.
- Results table.
- Provider status badges.
- Edit song dialog.
- Recheck item action.
- JSON and CSV export links.
- Error state.

## Verification

- Unit tests for playlist URL parser.
- Unit tests for title parser.
- Unit tests for match scoring.
- API tests for create/get/update/recheck/export happy paths and validation failures.
- Frontend tests for submit and result rendering.
- Run `pnpm verify`.
- Run `pnpm verify:full` if router or full user flow coverage is changed.

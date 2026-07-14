export function parsePlaylistUrl(value: string): string {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('Invalid YouTube playlist URL')
  }

  const playlistId = url.searchParams.get('list')

  if (!playlistId) {
    throw new Error('YouTube playlist URL must include a list parameter')
  }

  return playlistId
}

const NOISE_PATTERNS = [
  /\bofficial\s*(music\s*)?(video|mv)\b/gi,
  /\b(music\s*)?video\b/gi,
  /\bmv\b/gi,
  /\bpv\b/gi,
  /\blyrics?\b/gi,
  /歌詞付き?/g,
  /歌ってみた/g,
  /\bcover(ed)?\b/gi,
  /\blive\b/gi,
]

export function normalizeText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/[｜]/g, '|')
    .replace(/[!！?？.,，。・:：;；]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stripTitleNoise(value: string): string {
  let result = normalizeText(value)

  for (const pattern of NOISE_PATTERNS) {
    result = result.replace(pattern, ' ')
  }

  return result.replace(/\s+/g, ' ').trim()
}

export function removeBracketNoise(value: string): string {
  return value
    .replace(/【[^】]*】/g, ' ')
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasNoiseMarker(value: string): boolean {
  return NOISE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0
    return pattern.test(value)
  })
}

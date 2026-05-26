export type ParsedBellAddress = {
  /** Original cleaned address for display */
  display: string
  /** Best-effort query string for forward geocoders */
  geocodeQuery: string
  street?: string
  city?: string
  zip?: string
  venueName?: string
  /** e.g. "Gettysburg, PA" — derived without reverse geocoding */
  localityLabel?: string
}

const STREET_TOKEN_RE =
  /\b(st|street|sts|rd|road|ave|avenue|blvd|boulevard|way|dr|drive|hwy|highway|route|rt|pike|lane|ln|circle|cir|court|ct|plaza|park|trail|turnpike|tpke|square|sq)\b/i

function streetSegmentScore(segment: string): number {
  const value = segment.trim()
  if (!value) return 0
  if (/^St\.\s+[A-Z]/i.test(value)) return 0
  if (/^(?:[\w\s'-]+\s+)?park$/i.test(value)) return 0
  if (/^\d+(?:-\d+)?[A-Za-z]?\s+\S/.test(value)) return 3
  if (/^\d+(?:-\d+)?\s/.test(value)) return 3
  if (/\band\b/i.test(value) && STREET_TOKEN_RE.test(value)) return 2
  if (STREET_TOKEN_RE.test(value)) return 1
  return 0
}

function isStateZipSegment(segment: string): boolean {
  return /\bPA\b/i.test(segment) && /\d{5}/.test(segment)
}

export function parseBellAddress(raw: string): ParsedBellAddress {
  const withoutNotes = raw.split('|')[0]?.trim() ?? raw
  const display = withoutNotes.replace(/\s+/g, ' ').trim()

  const zipMatch = withoutNotes.match(/\bPA\s+(\d{5})(?:-\d{4})?\b/i)
  let zip = zipMatch?.[1]
  if (!zip) {
    const trailingZip = withoutNotes.match(/,\s*(\d{5})(?:-\d{4})?\s*$/)
    zip = trailingZip?.[1]
  }

  const cityMatch = withoutNotes.match(/,\s*([^,]+),\s*PA\b/i)
  const city = cityMatch?.[1]?.trim()

  const parts = withoutNotes
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  let street: string | undefined
  let venueName: string | undefined
  let bestStreetScore = 0

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (isStateZipSegment(part) || /^PA$/i.test(part)) continue

    const score = streetSegmentScore(part)
    if (score > bestStreetScore) {
      bestStreetScore = score
      street = part
      venueName = i > 0 ? parts.slice(0, i).join(', ') : undefined
    }
  }

  if (!street && parts.length >= 2) {
    const candidate = parts[1]
    if (candidate && /\band\b/i.test(candidate)) {
      street = candidate
      venueName = parts[0]
    }
  }

  let geocodeQuery: string
  if (street && city && zip) {
    geocodeQuery = `${street}, ${city}, PA ${zip}`
  } else if (street && city) {
    geocodeQuery = `${street}, ${city}, PA`
  } else if (street && zip) {
    geocodeQuery = `${street}, PA ${zip}`
  } else if (street) {
    geocodeQuery = `${street}, PA`
  } else if (city && zip) {
    geocodeQuery = `${city}, PA ${zip}`
  } else if (city) {
    geocodeQuery = `${city}, PA`
  } else {
    geocodeQuery = withoutNotes
    if (!/\bPA\b/i.test(geocodeQuery)) geocodeQuery += ', PA'
  }

  const localityLabel = city ? `${city}, PA` : undefined

  return {
    display,
    geocodeQuery,
    street,
    city,
    zip,
    venueName,
    localityLabel,
  }
}

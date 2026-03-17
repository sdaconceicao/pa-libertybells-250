import * as cheerio from 'cheerio'
import type { RawBell } from './types'

// America250PA Bells page: county name in caps, then "Bell Title", then
// Artist:, Current Location:, optional Unveiling Location:, Sponsor:.
// Parse the main content as text and extract blocks by COUNTY lines.

const COUNTY_TITLE_RE = /^([A-Z][A-Za-z\s\-']+COUNTY)\s*[""]([^""]+)[""]\s*$/i
const KEY_RE = /^(Artist|Current Location|Unveiling Location|Sponsor):\s*(.*)$/i

export function parseBells(html: string): RawBell[] {
  const $ = cheerio.load(html)
  // Prefer main content; fallback to body.
  const content =
    $('.mw-parser-output').text() ||
    $('#bodyContent').text() ||
    $('main').text() ||
    $('body').text()

  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const bells: RawBell[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const countyTitleMatch = line.match(COUNTY_TITLE_RE)
    if (!countyTitleMatch) {
      i++
      continue
    }

    const countyRaw = countyTitleMatch[1].trim()
    const county = countyRaw.replace(/\s+COUNTY$/i, '').trim() || countyRaw
    const title = countyTitleMatch[2].trim()
    i++

    let artist: string | undefined
    let currentAddress = ''
    let unveilingAddress: string | undefined
    let sponsor: string | undefined

    while (i < lines.length) {
      const next = lines[i]
      if (next.match(COUNTY_TITLE_RE)) break

      const keyMatch = next.match(KEY_RE)
      if (keyMatch) {
        const key = keyMatch[1].toLowerCase()
        const value = keyMatch[2].trim()
        if (key === 'artist') artist = value || undefined
        else if (key === 'current location') currentAddress = value
        else if (key === 'unveiling location') unveilingAddress = value || undefined
        else if (key === 'sponsor') sponsor = value || undefined
      }
      i++
    }

    // Use unveiling as address if current is missing so we still geocode
    const address = currentAddress || unveilingAddress || ''
    if (!address) continue

    const id = `${county}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    bells.push({
      id,
      county,
      title,
      artist,
      currentAddress: address,
      unveilingAddress,
      imageUrl: undefined,
      sponsor,
      sourceSlug: id,
    })
  }

  return bells
}

import * as cheerio from 'cheerio'
import type { RawBell } from './types'

const FIELD_RE =
  /^(Artist|Current Location|Unveiling Location|Sponsor):\s*(.*)$/i
const TITLE_QUOTE_RE = /[""\u201c]([^""\u201d]+)[""\u201d]/

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function slugify(county: string, title: string): string {
  return `${county}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function parseBells(html: string): RawBell[] {
  const $ = cheerio.load(html)
  const bells: RawBell[] = []

  $('.gridCell.col').each((_, el) => {
    const $cell = $(el)
    let county = ''
    let title = ''
    let artist: string | undefined
    let currentAddress = ''
    let unveilingAddress: string | undefined
    let sponsor: string | undefined

    const imageUrl = $cell.find('img').first().attr('src') || undefined

    $cell.find('p').each((__, p) => {
      const text = normalizeText($(p).text())
      if (!text || text.startsWith('*')) return

      if (!county && /COUNTY/i.test(text)) {
        const countyMatch = text.match(/([A-Z][A-Za-z\s\-']+)\s+COUNTY/i)
        if (countyMatch) county = countyMatch[1].trim()

        const titleMatch = text.match(TITLE_QUOTE_RE)
        if (titleMatch) title = titleMatch[1].trim()
        return
      }

      const keyMatch = text.match(FIELD_RE)
      if (!keyMatch) return

      const key = keyMatch[1].toLowerCase()
      const value = keyMatch[2].trim()
      if (key === 'artist') artist = value || undefined
      else if (key === 'current location') currentAddress = value
      else if (key === 'unveiling location') unveilingAddress = value || undefined
      else if (key === 'sponsor' && value) sponsor = value
    })

    if (!county || !title) return

    const address = currentAddress || unveilingAddress || ''
    if (!address) return

    const id = slugify(county, title)
    bells.push({
      id,
      county,
      title,
      artist,
      currentAddress: address,
      unveilingAddress,
      imageUrl,
      sponsor,
      sourceSlug: id,
    })
  })

  return bells
}

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'

import { getCountyCentroid } from './countyCentroids'
import { parseBellAddress } from './parseAddress'
import { geocodeWithOpenCage } from './providers/opencage'
import type {
  GeocodeQuality,
  GeocodeSource,
  GeocodedBell,
  RawBell,
} from './types'

type CacheEntry = {
  lat: number
  lng: number
  source: GeocodeSource
  quality: GeocodeQuality
  localityLabel?: string
}

type CacheFile = Record<string, CacheEntry>

type OverrideEntry = { lat: number; lng: number; localityLabel?: string }
type OverrideFile = Record<string, OverrideEntry>

type GeocodeAttempt = {
  lat: number
  lng: number
  source: GeocodeSource
  quality: GeocodeQuality
  localityLabel?: string
}

export type GeocodeSummary = {
  parsed: number
  exact: number
  approximate: number
  overrides: number
  bySource: Record<GeocodeSource, number>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CACHE_PATH = path.resolve(__dirname, 'geocode-cache.json')
const OVERRIDES_PATH = path.resolve(__dirname, 'geocode-overrides.json')

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY ?? ''
const NOMINATIM_BASE =
  process.env.GEOCODER_BASE_URL ?? 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_EMAIL =
  process.env.GEOCODER_EMAIL ?? 'testinggeocoder@gmail.com'

const CENSUS_BASE =
  'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'

async function readCache(): Promise<CacheFile> {
  try {
    const json = await fs.readFile(CACHE_PATH, 'utf8')
    return JSON.parse(json) as CacheFile
  } catch {
    return {}
  }
}

async function writeCache(cache: CacheFile): Promise<void> {
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8')
}

async function readOverrides(): Promise<OverrideFile> {
  try {
    const json = await fs.readFile(OVERRIDES_PATH, 'utf8')
    return JSON.parse(json) as OverrideFile
  } catch {
    return {}
  }
}

function normalizeCacheKey(query: string): string {
  return query.replace(/\s+/g, ' ').trim().toLowerCase()
}

async function geocodeWithCensus(query: string): Promise<GeocodeAttempt | null> {
  const url = new URL(CENSUS_BASE)
  url.searchParams.set('address', query)
  url.searchParams.set('benchmark', 'Public_AR_Current')
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = (await res.json()) as {
    result?: {
      addressMatches?: Array<{
        coordinates?: { x: number; y: number }
        matchedAddress?: string
      }>
    }
  }

  const match = data.result?.addressMatches?.[0]
  if (!match?.coordinates) return null

  return {
    lat: match.coordinates.y,
    lng: match.coordinates.x,
    source: 'census',
    quality: 'exact',
  }
}

async function geocodeWithNominatim(
  street: string | undefined,
  city: string | undefined,
  zip: string | undefined,
): Promise<GeocodeAttempt | null> {
  const url = new URL(NOMINATIM_BASE)
  if (street) url.searchParams.set('street', street)
  if (city) url.searchParams.set('city', city)
  url.searchParams.set('state', 'Pennsylvania')
  if (zip) url.searchParams.set('postalcode', zip)
  url.searchParams.set('country', 'USA')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': `bells-across-pa-map/1.0 (${NOMINATIM_EMAIL})`,
    },
  })

  if (!res.ok) return null

  const data = (await res.json()) as Array<{ lat: string; lon: string }>
  const first = data[0]
  if (!first) return null

  await new Promise((r) => setTimeout(r, 1100))

  return {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
    source: 'nominatim',
    quality: 'exact',
  }
}

async function geocodeParsedAddress(
  geocodeQuery: string,
  parsed: ReturnType<typeof parseBellAddress>,
  cache: CacheFile,
): Promise<GeocodeAttempt | null> {
  const cacheKey = normalizeCacheKey(geocodeQuery)
  const cached = cache[cacheKey]
  if (cached) return cached

  if (OPENCAGE_API_KEY) {
    const openCage = await geocodeWithOpenCage(geocodeQuery, OPENCAGE_API_KEY)
    if (openCage) {
      const entry: GeocodeAttempt = {
        lat: openCage.lat,
        lng: openCage.lng,
        source: 'opencage',
        quality: 'exact',
        localityLabel: openCage.localityLabel ?? parsed.localityLabel,
      }
      cache[cacheKey] = entry
      await writeCache(cache)
      return entry
    }
  }

  const census = await geocodeWithCensus(geocodeQuery)
  if (census) {
    census.localityLabel = parsed.localityLabel
    cache[cacheKey] = census
    await writeCache(cache)
    return census
  }

  const nominatim = await geocodeWithNominatim(
    parsed.street,
    parsed.city,
    parsed.zip,
  )
  if (nominatim) {
    nominatim.localityLabel = parsed.localityLabel
    cache[cacheKey] = nominatim
    await writeCache(cache)
    return nominatim
  }

  return null
}

export async function geocodeBellAddresses(
  rawBells: RawBell[],
): Promise<{ bells: GeocodedBell[]; summary: GeocodeSummary }> {
  const cache = await readCache()
  const overrides = await readOverrides()
  const result: GeocodedBell[] = []

  const summary: GeocodeSummary = {
    parsed: rawBells.length,
    exact: 0,
    approximate: 0,
    overrides: 0,
    bySource: {
      opencage: 0,
      census: 0,
      nominatim: 0,
      override: 0,
      county_centroid: 0,
    },
  }

  for (const bell of rawBells) {
    const parsed = parseBellAddress(bell.currentAddress)
    let attempt: GeocodeAttempt | null = null

    const override = overrides[bell.id]
    if (override) {
      attempt = {
        lat: override.lat,
        lng: override.lng,
        source: 'override',
        quality: 'exact',
        localityLabel: override.localityLabel ?? parsed.localityLabel,
      }
      summary.overrides++
    } else {
      attempt = await geocodeParsedAddress(parsed.geocodeQuery, parsed, cache)
    }

    if (!attempt) {
      const centroid = getCountyCentroid(bell.county)
      if (centroid) {
        attempt = {
          lat: centroid.lat,
          lng: centroid.lng,
          source: 'county_centroid',
          quality: 'approximate',
          localityLabel: `${bell.county} County, PA`,
        }
        console.warn(
          'Using county centroid for bell',
          bell.title,
          'address',
          bell.currentAddress,
        )
      }
    }

    if (!attempt) {
      console.warn(
        'No coordinates for bell',
        bell.title,
        'address',
        bell.currentAddress,
      )
      continue
    }

    if (attempt.quality === 'exact') summary.exact++
    else summary.approximate++

    summary.bySource[attempt.source]++

    result.push({
      ...bell,
      lat: attempt.lat,
      lng: attempt.lng,
      geocodeQuality: attempt.quality,
      geocodeSource: attempt.source,
      localityLabel: attempt.localityLabel ?? parsed.localityLabel,
    })
  }

  return { bells: result, summary }
}

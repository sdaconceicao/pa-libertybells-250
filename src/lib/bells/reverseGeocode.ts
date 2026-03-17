/**
 * Client-side reverse geocoding via BigDataCloud Free API.
 * Converts latitude/longitude to locality (city, state, etc.).
 * @see https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api
 */

const BIGDATACLOUD_REVERSE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client'

export type ReverseGeocodeResult = {
  locality?: string
  city?: string
  principalSubdivision?: string
  countryName?: string
  postcode?: string
  lookupSource: string
}

/**
 * Reverse geocode coordinates to locality (city, state). Call from the browser only.
 * Uses BigDataCloud free client endpoint; no API key required.
 */
export async function reverseGeocodeToCity(
  latitude: number,
  longitude: number,
  options?: { localityLanguage?: string },
): Promise<ReverseGeocodeResult | null> {
  const url = new URL(BIGDATACLOUD_REVERSE_URL)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('localityLanguage', options?.localityLanguage ?? 'en')

  const res = await fetch(url.toString())

  if (!res.ok) {
    if (res.status === 402) {
      console.warn(
        'BigDataCloud: server-side or pre-stored coordinates not allowed on free client endpoint.',
      )
    }
    return null
  }

  const data = (await res.json()) as {
    city?: string
    locality?: string
    principalSubdivision?: string
    countryName?: string
    postcode?: string
    lookupSource?: string
  }

  return {
    locality: data.locality,
    city: data.city,
    principalSubdivision: data.principalSubdivision,
    countryName: data.countryName,
    postcode: data.postcode,
    lookupSource: data.lookupSource ?? 'unknown',
  }
}

/** Format reverse geocode result as a short place string (e.g. "Philadelphia, PA"). */
export function formatLocalityShort(result: ReverseGeocodeResult): string {
  const parts: string[] = []
  if (result.city) parts.push(result.city)
  else if (result.locality) parts.push(result.locality)
  if (result.principalSubdivision) parts.push(result.principalSubdivision)
  return parts.length ? parts.join(', ') : ''
}

export type RawBell = {
  id: string
  county: string
  title: string
  artist?: string
  currentAddress: string
  unveilingAddress?: string
  imageUrl?: string
  sponsor?: string
  sourceSlug: string
}

export type GeocodeQuality = 'exact' | 'approximate'

export type GeocodeSource =
  | 'opencage'
  | 'census'
  | 'nominatim'
  | 'override'
  | 'county_centroid'

export type GeocodedBell = RawBell & {
  lat: number
  lng: number
  /** City/locality derived at sync time (e.g. "Philadelphia, PA") */
  localityLabel?: string
  geocodeQuality?: GeocodeQuality
  geocodeSource?: GeocodeSource
}

export type Bell = GeocodedBell

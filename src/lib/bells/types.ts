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

export type GeocodedBell = RawBell & {
  lat: number
  lng: number
  /** Locality string from BigDataCloud reverse geocode (e.g. "Philadelphia, PA") */
  localityLabel?: string
}

export type Bell = GeocodedBell


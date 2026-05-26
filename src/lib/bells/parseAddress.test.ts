import { describe, expect, it } from 'vitest'
import { parseBellAddress } from './parseAddress'

describe('parseBellAddress', () => {
  it('strips venue name and keeps street for geocoding', () => {
    const parsed = parseBellAddress(
      'Beyond the Battle Museum, 625 Biglerville Road, Gettysburg, PA 17325',
    )
    expect(parsed.geocodeQuery).toBe(
      '625 Biglerville Road, Gettysburg, PA 17325',
    )
    expect(parsed.venueName).toBe('Beyond the Battle Museum')
    expect(parsed.localityLabel).toBe('Gettysburg, PA')
  })

  it('handles street-first addresses', () => {
    const parsed = parseBellAddress('620 W 3rd St, Bloomsburg, PA, 17815')
    expect(parsed.geocodeQuery).toBe('620 W 3rd St, Bloomsburg, PA 17815')
    expect(parsed.city).toBe('Bloomsburg')
  })

  it('strips pipe-delimited location notes', () => {
    const parsed = parseBellAddress(
      '620 W 3rd St, Bloomsburg, PA, 17815 | Located inside Gate 2 off of Route 11.',
    )
    expect(parsed.display).not.toContain('|')
    expect(parsed.geocodeQuery).toContain('620 W 3rd St')
  })

  it('handles intersections without street numbers', () => {
    const parsed = parseBellAddress(
      'Weissport Park, Bridge and Franklin Streets, Weissport, PA 18032',
    )
    expect(parsed.street).toBe('Bridge and Franklin Streets')
    expect(parsed.geocodeQuery).toBe(
      'Bridge and Franklin Streets, Weissport, PA 18032',
    )
  })

  it('falls back to city when only venue and city are present', () => {
    const parsed = parseBellAddress('Visit Luzerne County, Wilkes-Barre, PA')
    expect(parsed.geocodeQuery).toBe('Wilkes-Barre, PA')
    expect(parsed.localityLabel).toBe('Wilkes-Barre, PA')
  })

  it('handles hyphenated street numbers', () => {
    const parsed = parseBellAddress(
      'Lancaster Avenue 21st Century Business Association (LA21), 3952-54 Lancaster Ave., Philadelphia, PA 19104',
    )
    expect(parsed.geocodeQuery).toBe('3952-54 Lancaster Ave., Philadelphia, PA 19104')
  })
})

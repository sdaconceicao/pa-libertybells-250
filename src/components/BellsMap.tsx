import { useEffect, useState } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import type { Bell } from '../lib/bells/types'
import {
  reverseGeocodeToCity,
  formatLocalityShort,
  type ReverseGeocodeResult,
} from '../lib/bells/reverseGeocode'

type LeafletModule = typeof import('react-leaflet')
type LModule = typeof import('leaflet')

type Props = {
  bells: Bell[]
}

export function BellsMap({ bells }: Props) {
  return (
    <ClientOnly
      fallback={
        <div className="island-shell rise-in flex min-h-[480px] w-full items-center justify-center rounded-[1.5rem] text-sm text-[var(--sea-ink-soft)]">
          Loading map…
        </div>
      }
    >
      <LeafletMap bells={bells} />
    </ClientOnly>
  )
}

function LeafletMap({ bells }: Props) {
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null)
  const [L, setL] = useState<LModule | null>(null)

  useEffect(() => {
    let mounted = true
    void (async () => {
      const [reactLeaflet, leafletLib] = await Promise.all([
        import('react-leaflet'),
        import('leaflet'),
        import('leaflet/dist/leaflet.css'),
      ])
      if (!mounted) return
      setLeaflet(reactLeaflet)
      setL(leafletLib)
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (!leaflet || !L) {
    return (
      <div className="island-shell rise-in flex min-h-[480px] w-full items-center justify-center rounded-[1.5rem] text-sm text-[var(--sea-ink-soft)]">
        Loading map…
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = leaflet

  // Fix default icon paths for Leaflet in bundlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(L.Icon.Default as any).mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const center: [number, number] = [40.9, -77.8]

  return (
    <div
      className="island-shell rise-in w-full overflow-hidden rounded-[1.5rem]"
      style={{ minHeight: 480, height: 480 }}
    >
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: '100%', width: '100%', minHeight: 480 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bells.map((bell) => (
          <Marker key={bell.id} position={[bell.lat, bell.lng]}>
            <Popup>
              <BellPopupContent bell={bell} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

function BellPopupContent({ bell }: { bell: Bell }) {
  const [locality, setLocality] = useState<ReverseGeocodeResult | null | undefined>(undefined)

  useEffect(() => {
    if (bell.localityLabel) return
    let cancelled = false
    reverseGeocodeToCity(bell.lat, bell.lng)
      .then((result) => {
        if (!cancelled) setLocality(result ?? null)
      })
      .catch(() => {
        if (!cancelled) setLocality(null)
      })
    return () => {
      cancelled = true
    }
  }, [bell.lat, bell.lng, bell.localityLabel])

  const localityShort =
    bell.localityLabel ?? (locality ? formatLocalityShort(locality) : null)

  return (
    <div className="space-y-1 text-sm">
      <h3 className="m-0 text-base font-semibold">
        {bell.title}{' '}
        <span className="text-xs text-[var(--sea-ink-soft)]">
          ({bell.county} County)
        </span>
      </h3>
      {bell.artist ? (
        <p className="m-0 text-[var(--sea-ink-soft)]">
          Artist: {bell.artist}
        </p>
      ) : null}
      <p className="m-0 text-[var(--sea-ink-soft)]">
        Current location: {bell.currentAddress}
      </p>
      {localityShort ? (
        <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
          Locality: {localityShort}
        </p>
      ) : locality === null ? null : (
        <p className="m-0 text-xs text-[var(--sea-ink-soft)]">Loading locality…</p>
      )}
      {bell.imageUrl ? (
        <img
          src={bell.imageUrl}
          alt={bell.title}
          className="mt-1 max-h-32 w-full rounded-lg object-cover"
        />
      ) : null}
    </div>
  )
}


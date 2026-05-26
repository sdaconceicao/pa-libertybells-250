import { ClientOnly } from '@tanstack/react-router'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useEffect, useRef, useState } from 'react'
import type { Bell } from '../lib/bells/types'
import styles from './BellsMap.module.css'

function configureLeafletDefaultIcons(L: LModule) {
  // Leaflet prepends its dist path to icon URLs unless _getIconUrl is removed.
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })
}

type LeafletModule = typeof import('react-leaflet')
type LModule = typeof import('leaflet')
type MapRef = import('react-leaflet').MapRef

type Props = {
  bells: Bell[]
}

const DEFAULT_CENTER: [number, number] = [40.87, -77.79]
const DEFAULT_ZOOM = 7

function focusMapOnMarkers(
  map: import('leaflet').Map,
  L: LModule,
  bells: Bell[],
) {
  map.invalidateSize()

  if (bells.length === 0) {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    return
  }

  if (bells.length === 1) {
    map.setView([bells[0].lat, bells[0].lng], 12)
    return
  }

  const bounds = L.latLngBounds(
    bells.map((bell) => L.latLng(bell.lat, bell.lng)),
  )
  map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 })
}

export function BellsMap({ bells }: Props) {
  return (
    <ClientOnly
      fallback={<div className={styles.loading}>Loading map…</div>}
    >
      <LeafletMap bells={bells} />
    </ClientOnly>
  )
}

function LeafletMap({ bells }: Props) {
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null)
  const [L, setL] = useState<LModule | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<MapRef>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    void (async () => {
      const [reactLeaflet, leafletLib] = await Promise.all([
        import('react-leaflet'),
        import('leaflet'),
        import('leaflet/dist/leaflet.css'),
      ])
      if (!mounted) return
      configureLeafletDefaultIcons(leafletLib)
      setLeaflet(reactLeaflet)
      setL(leafletLib)
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const shell = shellRef.current
    const map = mapRef.current
    if (!mapReady || !shell || !map || !L) {
      return
    }

    const syncView = () => {
      focusMapOnMarkers(map, L, bells)
    }

    syncView()

    const observer = new ResizeObserver(() => {
      syncView()
    })
    observer.observe(shell)

    return () => {
      observer.disconnect()
    }
  }, [L, mapReady, bells])

  if (!leaflet || !L) {
    return <div className={styles.loading}>Loading map…</div>
  }

  const { MapContainer, TileLayer, Marker, Popup } = leaflet
  const initialCenter: [number, number] =
    bells.length > 0 ? [bells[0].lat, bells[0].lng] : DEFAULT_CENTER

  return (
    <div ref={shellRef} className={styles.mapShell}>
      <MapContainer
        ref={mapRef}
        center={initialCenter}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        whenReady={() => {
          setMapReady(true)
        }}
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
  return (
    <div className={styles.popup}>
      <h3 className={styles.popupTitle}>
        {bell.title}{' '}
        <span className={styles.popupCounty}>({bell.county} County)</span>
      </h3>
      {bell.artist ? (
        <p className={styles.popupMeta}>Artist: {bell.artist}</p>
      ) : null}
      <p className={styles.popupMeta}>
        Current location: {bell.currentAddress}
      </p>
      {bell.localityLabel ? (
        <p className={styles.popupLocality}>
          Locality: {bell.localityLabel}
        </p>
      ) : null}
      {bell.geocodeQuality === 'approximate' ? (
        <p className={styles.popupWarning}>
          Approximate map location ({bell.geocodeSource})
        </p>
      ) : null}
      {bell.imageUrl ? (
        <img
          src={bell.imageUrl}
          alt={bell.title}
          className={styles.popupImage}
        />
      ) : null}
    </div>
  )
}

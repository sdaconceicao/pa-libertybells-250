import type { Map as LeafletMapInstance } from 'leaflet'
import type * as Leaflet from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import type { Bell } from '../../lib/bells/types'
import { BellPopupContent } from '../BellPopupContent/BellPopupContent'
import { MapLoading } from '../MapLoading/MapLoading'
import { configureLeafletDefaultIcons } from './configureLeafletIcons'
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  focusMapOnMarkers,
} from './focusMapOnMarkers'
import styles from './LeafletMap.module.css'

type ReactLeafletModule = typeof import('react-leaflet')

type Props = {
  bells: Bell[]
}

export function LeafletMap({ bells }: Props) {
  const [leaflet, setLeaflet] = useState<ReactLeafletModule | null>(null)
  const [L, setL] = useState<typeof Leaflet | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<LeafletMapInstance>(null)
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
    return <MapLoading />
  }

  const { MapContainer, TileLayer, Marker, Popup } = leaflet
  const initialCenter: [number, number] =
    bells.length > 0 ? [bells[0].lat, bells[0].lng] : DEFAULT_MAP_CENTER

  return (
    <div ref={shellRef} className={styles.mapShell}>
      <MapContainer
        ref={mapRef}
        center={initialCenter}
        zoom={DEFAULT_MAP_ZOOM}
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

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

type LModule = typeof import('leaflet')

export function configureLeafletDefaultIcons(L: LModule) {
  // Leaflet prepends its dist path to icon URLs unless _getIconUrl is removed.
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })
}

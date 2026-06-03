import type * as Leaflet from "leaflet";
import bellMarkerSvg from "./bell-marker.svg?raw";
import styles from "./LeafletMap.module.css";

const MARKER_WIDTH = 32;
const MARKER_HEIGHT = 40;

export function createBellMarkerIcon(L: typeof Leaflet): Leaflet.DivIcon {
	return L.divIcon({
		className: styles.bellMarker,
		html: bellMarkerSvg,
		iconSize: [MARKER_WIDTH, MARKER_HEIGHT],
		iconAnchor: [MARKER_WIDTH / 2, MARKER_HEIGHT],
		popupAnchor: [0, -MARKER_HEIGHT],
	});
}

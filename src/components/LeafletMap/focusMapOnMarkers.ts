import type { Map as LeafletMapInstance } from "leaflet";
import type * as Leaflet from "leaflet";
import type { Bell } from "../../lib/bells/types";

export const DEFAULT_MAP_CENTER: [number, number] = [40.87, -77.79];
export const DEFAULT_MAP_ZOOM = 7;

export function focusMapOnMarkers(
	map: LeafletMapInstance,
	L: typeof Leaflet,
	bells: Bell[],
) {
	map.invalidateSize();

	if (bells.length === 0) {
		map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
		return;
	}

	if (bells.length === 1) {
		map.setView([bells[0].lat, bells[0].lng], 12);
		return;
	}

	const bounds = L.latLngBounds(
		bells.map((bell) => L.latLng(bell.lat, bell.lng)),
	);
	map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
}

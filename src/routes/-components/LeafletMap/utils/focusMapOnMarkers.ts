import type { Map as LeafletMapInstance } from "leaflet";
import type * as Leaflet from "leaflet";
import type { Bell } from "../../../../lib/bells/types";
import {
	getFitBoundsPadding,
	getMapCenterOffset,
	type MapViewportPadding,
} from "./mapViewportPadding";

export const DEFAULT_MAP_CENTER: [number, number] = [40.87, -77.79];
export const DEFAULT_MAP_ZOOM = 7;

const DEFAULT_PADDING: MapViewportPadding = {
	top: 24,
	right: 24,
	bottom: 24,
	left: 24,
};

function applyMapViewportCenterOffset(
	map: LeafletMapInstance,
	padding: MapViewportPadding,
) {
	const [offsetX, offsetY] = getMapCenterOffset(padding);
	map.panBy([-offsetX, -offsetY], { animate: false });
}

function centerMapWithPadding(
	map: LeafletMapInstance,
	latLng: [number, number],
	zoom: number,
	padding: MapViewportPadding,
) {
	map.setView(latLng, zoom, { animate: false });
	applyMapViewportCenterOffset(map, padding);
}

export function focusMapOnMarkers(
	map: LeafletMapInstance,
	L: typeof Leaflet,
	bells: Bell[],
	padding: MapViewportPadding = DEFAULT_PADDING,
) {
	map.invalidateSize();

	if (bells.length === 0) {
		centerMapWithPadding(map, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, padding);
		return;
	}

	if (bells.length === 1) {
		centerMapWithPadding(map, [bells[0].lat, bells[0].lng], 12, padding);
		return;
	}

	const bounds = L.latLngBounds(
		bells.map((bell) => L.latLng(bell.lat, bell.lng)),
	);
	const fitBoundsPadding = getFitBoundsPadding(padding);
	map.fitBounds(bounds, {
		...fitBoundsPadding,
		maxZoom: 13,
	});
	applyMapViewportCenterOffset(map, padding);
}
